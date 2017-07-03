# georgia-district-6 election data

This project contains the raw election files from the Georgia 6th District

Basedon the project [TimeMagazine/georgia-special-election](https://github.com/TimeMagazine/georgia-special-election)

## Which election

* Files with 1611 in the name are from the general election
* Files with 1704 in the name are from the runoff election
* Files with 1706 in the name are from the special election

## Precinct or county data

* Precinct files have precinct in the name. The name may also include the county, unless it's a state wide summary.
* County files do not include the precincts.

## The folders

* `elections` the raw election result XML files downloaded from [Georgia Secetary Of State Elections](http://sos.ga.gov/index.php/elections)
* `raw-csv` the raw elections results transformed from XML to CSV format limited to the 2016 Presedential election and the Georgia 6th elections in 2016 and 2017.
* `csv` combined and analyzed results.

## Roadmap

* Add some voting demographic data into analysis
* Start the analysis and reporting of the results

## The scripts

* `fetch_results.js` is a nodejs script that fetches the XML results for all the elections. The results are then available in `elections`
* `extract_results.js` is a nodejs script that extracts the XML results for the presidential and Georgia 6th district elections. The raw result csv files are then available in `raw-csv`
* `1706-county.R` combines the precinct files to create county level sumaries. The results are placed in `csv`

## Dependencies
### nodejs
Use `npm install *module*`
* `adm-zip`
* `async`
* `capitalize`
* `d3`
* `npmlog`
* `pascal-case`
* `request`
* `xml2js`

## R
* `lsr`

