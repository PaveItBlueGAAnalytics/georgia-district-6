const fs = require('fs');
const path = require('path')
const request = require('request');
const AdmZip = require('adm-zip');
const async = require('async');
const logger = require('npmlog')

var elections =[
	{
		type: "general",
		date: "1611",
		state: "GA",
		stateFile: "http://results.enr.clarityelections.com/GA/63991/184321/reports/detailxml.zip",
		countyFiles: {
			Cobb: "http://results.enr.clarityelections.com/GA/Cobb/64025/183446/reports/detailxml.zip",
			DeKalb: "http://results.enr.clarityelections.com/GA/DeKalb/64036/183321/reports/detailxml.zip",
			Fulton: "http://results.enr.clarityelections.com/GA/Fulton/64052/183520/reports/detailxml.zip"
		}
	},
	{
		type: "special",
		date: "1704",
		state: "GA",
		stateFile: "http://results.enr.clarityelections.com/GA/67317/186181/reports/detailxml.zip",
		countyFiles: {
			Cobb: "http://results.enr.clarityelections.com/GA/Cobb/67351/186064/reports/detailxml.zip",
			DeKalb: "http://results.enr.clarityelections.com/GA/DeKalb/67362/186056/reports/detailxml.zip",
			Fulton: "http://results.enr.clarityelections.com/GA/Fulton/67378/186038/reports/detailxml.zip"
		}
	},
	{
		type: "special",
		date: "1706",
		state: "GA",
		stateFile: "http://results.enr.clarityelections.com/GA/70059/187838/reports/detailxml.zip",
		countyFiles: {
			Cobb: "http://results.enr.clarityelections.com/GA/Cobb/70093/187829/reports/detailxml.zip",
			DeKalb: "http://results.enr.clarityelections.com/GA/DeKalb/70104/187817/reports/detailxml.zip",
			Fulton: "http://results.enr.clarityelections.com/GA/Fulton/70120/187831/reports/detailxml.zip"
		}
	}
];

function fetch() {
	// prepare the download list
	var downloads = [];
	elections.forEach(function(election) {
		if (election["stateFile"]) {
			downloads.push({
				type: election.type,
				date: election.date,
				level: "county",
				location: election.state,
				link: election.stateFile
			});
		}
		for (var key in election.countyFiles) {
			downloads.push({
				type: election.type,
				date: election.date,
				level: "precinct",
				location: election.state + "_" + key,
				link: election.countyFiles[key]
			});
		}
	});
	async.eachSeries(downloads, function(download, callback) {
		var file = download.date + "_" + download.location + "_" + download.type + "_" + download.level;
		var tFile = path.join(".", "zip", file + ".zip");
		var oFile = path.join(".", "elections", file + ".xml");
		logger.info("fetch()", download.link, "to", tFile);
		request(download.link).pipe(fs.createWriteStream(tFile)).on('close', function () {
			logger.info("fetch()", "extracting to", oFile);
            // unzip it save the XML in the elections directory, then delete the zip file
			var zip = new AdmZip(tFile);
			var xml = zip.readAsText("detail.xml");
			fs.writeFileSync(oFile, xml);
			fs.unlinkSync(tFile);
			callback();
		});
	}, function() {
		logger.info("fetch()", "complete");
	});
}

fetch();