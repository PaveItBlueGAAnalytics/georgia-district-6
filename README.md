# georgia-district-6 election data

This project contains the raw election files from the Georgia 6th District

Based on the project [github.com/TimeMagazine/georgia-special-election](https://github.com/TimeMagazine/georgia-special-election)

## Which file contains what

* Files with `1611` in the name are from the general election
* Files with `1704` in the name are from the runoff election
* Files with `1706` in the name are from the special election
* Files with `turnout` in the name contain the turnout data for the election
* Files with  `usrep6` in the name contain the results for Congressional district 6
* Files with `president` in the name contain the results for the Presidential election
* Files with `precinct` in the name contain the data broken out by precinct
* Files with `county` in the name contain the data at the county level

### Examples

#### Raw data

Filename | Contains
---------|---------
`raw-csv/1611_GA_Fulton_general_precinct_president_results.csv` | The Nov 16 general election results per precinct for the President
`raw-csv/1611_GA_Fulton_general_precinct_turnout.csv` | The Nov 16 general election turnout data
`raw-csv/1611_GA_Fulton_general_precinct_usrep6_results.csv` | The Nov 16 general election results per precinct for the Congressional District 6
`raw-csv/1704_GA_Fulton_special_precinct_turnout.csv` | The Apr 17 special election turnout data
`raw-csv/1704_GA_Fulton_special_precinct_usrep6_results.csv` | The Apr 17 runoff election results per precinct for the Congressional District 6
`raw-csv/1706_GA_Fulton_special_precinct_turnout.csv` | The Jun 17 special election turnout data
`raw-csv/1706_GA_Fulton_special_precinct_usrep6_results.csv` | The Jun 17 special election results per precinct for the Congressional District 6

#### Combined data

Filename | Contains
---------|---------
`csv/1706_county_results.csv` | The Jun 17 special election combined results per county
`csv/1706_precints_results.csv` | The Jun 17 special election combined results per county and precinct
`csv/1706_county_summary.csv` | The Jun 17 special election summary of key data per county

## The folders

* `elections` the raw election result XML files downloaded from [sos.ga.gov/index.php/elections](http://sos.ga.gov/index.php/elections)
* `raw-csv` the raw elections results transformed from XML to CSV format limited to the 2016 Presidential election and the Georgia 6th elections in 2016 and 2017.
* `csv` combined and analyzed results.

## Column headers
* `precinct` the precinct name
* `DEM`: Votes for the Democratic candidate or candidate(s)

## Roadmap

* Fix naming of files in the `csv` folder to better reflect their content
* Add some voting demographic data into analysis
* Start the analysis and reporting of the results

## The scripts

* `fetch_results.js` is a nodejs script that fetches the XML results for all the elections. The results are then available in `elections`
* `extract_results.js` is a nodejs script that extracts the XML results for the presidential and Georgia 6th district elections. The raw result csv files are then available in `raw-csv`
* `1706-county.R` combines the precinct files to create county level summaries. The results are placed in `csv`

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
### R
* `lsr`

