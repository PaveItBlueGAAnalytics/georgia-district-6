const fs = require('fs');
const path = require('path')
const d3 = require('d3')
const parseString = require('xml2js').parseString;
const logger = require('npmlog');
const capitalize = require('capitalize');
const pascalCase = require('pascal-case');

const contests = {
    "U.S. Representative, District 6": "usrep6",
    "President of the United States": "president"
};

const partyMapping = {
    HillaryClinton: "DEM",
    JonOssoff: "DEM",
    RodneyStooksbury: "DEM",
    RaginEdwards: "DEM",
    RichardKeatley: "DEM",
    RebeccaQuigg: "DEM",
    RonSlotin: "DEM",

    GaryJohnson: "LIB",

    DonaldJTrump: "REP",
    KarenHandel: "REP",
    TomPrice: "REP",
    DavidAbroms: "REP",
    MohammadAliBhuiyan: "REP",
    KeithGrawert: "REP",
    BobGray: "REP",
    JudsonHill: "REP",
    BruceLevell: "REP",
    AmyKremer: "REP",
    WilliamLlop: "REP",
    DanMoody: "REP",
    KurtWilson: "REP",

    AlexanderHernandez: "IND",
    AndrePollard: "IND"
}

const outputPath = path.join(".","raw-csv");

function getFilelist(done) {
    const dirName = path.join(".","elections");
    fs.readdir(dirName, function(err, dirList) {
        if (err) return done(err);
        dirList.forEach(function(dirEntry) {
            var filepath = path.join(dirName, dirEntry);
            if (filepath.match(/1.+\.xml$/i)) {
                fs.stat(filepath, function(err, stat) {
                    if (stat && stat.isFile()) {
                        done(null, filepath);
                    }
                });
            }
        });
    });
}

function parseElection(filepath) {
    var filename = path.basename(filepath, ".xml");
    var parts = filename.split(/\_/);
    var election = {
        type: parts[parts.length - 2],
        date: parts[0],
        state: parts[1],
        county: (parts.length == 5) ? parts[2] : null,
        level: parts[parts.length - 1],
        filename: filename
    };
    logger.info("parseElection()", election);
    return election;
}

function sortedColumns(key, results) {
    var columns = [];
    for (column in results[0]) {
        columns.push(column);
    }
    columns = columns.sort(function (a,b) {
        if (a == key) {
            return -1;
        }
        if (b == key) {
            return 1;
        }
        if (a == b) {
            return 0;
        }
        if (a < b) {
            return -1;
        }
        if (a > b) {
            return 1;
        }
    });
    return columns;
}

function extractTurnout(election, electionResult) {
    var key;
    var summary;
    var details;
    if (election.level == 'county') {
        key = "counties";
        summary = electionResult.ElectionVoterTurnout[0];
        details = electionResult.ElectionVoterTurnout[0].Counties[0].County;
    } else if (election.level == "precinct") {
        key = "precincts";
        summary = electionResult.VoterTurnout[0];
        details = electionResult.VoterTurnout[0].Precincts[0].Precinct;
    }
    var turnout = {
        totalVoters: summary.$.totalVoters,
        ballotsCast: summary.$.ballotsCast
    }
    var totalVoters = 0;
    var ballotsCast = 0;
    details.forEach(e => {
        var name = e.$.name.trim();
        turnout[key] = turnout[key] || {};
        turnout[key][name] = turnout[key][name] || {
            totalVoters: 0,
            ballotsCast: 0
        };
        totalVoters += +e.$.totalVoters;
        ballotsCast += +e.$.ballotsCast;
        turnout[key][name].totalVoters += +e.$.totalVoters;
        turnout[key][name].ballotsCast += +e.$.ballotsCast;
    });
    logger.info("extractTurnout() :: AUDIT", 
        "totalVoters", turnout.totalVoters, totalVoters, turnout.totalVoters == totalVoters,
        "ballotsCast", turnout.ballotsCast, ballotsCast, turnout.ballotsCast == ballotsCast);
    var results = d3.entries(turnout[key]);
    results.forEach(d => {
    	d.value[election.level] = d.key;
    });
   	results = results.map(d => { return d.value; });
    var filename = election.filename + "_turnout.csv";
    var filepath = path.join(outputPath,filename);
    logger.info("extractTurnout()", filepath);
    var csv = d3.csvFormat(results, sortedColumns(election.level, results));
    fs.writeFileSync(filepath, csv + "\n");
}

function accumulate(results, locationName, candidateName, voteTypeName, votes) {
    results[locationName] = results[locationName] || {};
    var aKey = candidateName + "_" + voteTypeName;
    results[locationName][aKey] = results[locationName][aKey] || 0;
    results[locationName][aKey] += votes;
    aKey = candidateName;
    results[locationName][aKey] = results[locationName][aKey] || 0;
    results[locationName][aKey] += votes;    
}

function extractResults(election, electionResult) {
    var key;
    var summary;
    var details;
    electionResult.Contest.forEach( ct => {
        var contestName = contests[ct.$.text.trim()];
        if (contestName) {
            var results = {};
            ct.Choice.forEach( cd => {
    			var candidateName = pascalCase(cd.$.text.trim().replace(/(\s*\(.+\)\s*)/g,""));
                logger.info("extractResults()", contestName, candidateName);
                cd.VoteType.forEach(vt => {
                    var voteTypeName = pascalCase(vt.$.name.replace(/\s+|\d+\s*$/g,"").trim());
                    var details;
                    if (election.level == "county") {
                        details = vt.County;
                    } else if (election.level == "precinct") {
                        details = vt.Precinct;
                    }
                    details.forEach(r => {
                        var locationName = r.$.name.trim();
                        accumulate(results, locationName, candidateName, voteTypeName, +r.$.votes);
                        if (partyMapping[candidateName]) {
                            var partyName = partyMapping[candidateName];
                            accumulate(results, locationName, partyName, voteTypeName, +r.$.votes);
                        } else {
                            logger.warn("extractResults()", "No party mapping for", candidateName);
                        }
                    });
                });
            });
            results = d3.entries(results);
            results.forEach(d => {
                d.value[election.level] = d.key;
            });
            results = results.map(d => { return d.value; });
            var filename = election.filename + "_" + contestName + "_results.csv";
            var filepath = path.join(outputPath,filename);
            logger.info("extractResults()", filepath);
            var csv = d3.csvFormat(results, sortedColumns(election.level, results));
           	fs.writeFileSync(filepath, csv + "\n");
        }
    });
}

function extract() {
    getFilelist(function(err, filepath) {
        if (err) throw err;
        logger.info("extract()", filepath);
        var election = parseElection(filepath);
        var xml = fs.readFileSync(filepath, "utf8");
       	parseString(xml, function (err, result) {
            if (err) {
                logger.error("extract()", filepath, err);
                return;
            }
            logger.info("extract()",result.ElectionResult.Region, result.ElectionResult.ElectionName, election.filename);
            extractTurnout(election, result.ElectionResult);
            extractResults(election, result.ElectionResult);
        });
    });
}

extract();
