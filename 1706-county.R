library(lsr)

addDetails <- function(m,ind) {
  if (ind) {
    m$IDRV <- (m$DEM + m$REP + m$IND)
  } else {
    m$IDRV <- (m$DEM + m$REP)
  }
  m$DRV <- (m$DEM + m$REP)
  m$BC_TV <- 100 * m$ballotsCast / m$totalVoters
  m$IDRV_BC <- 100 * m$IDRV / m$ballotsCast
  m$IDRV_TV <- 100 * m$IDRV / m$totalVoters
  m$DRV_BC <- 100 * m$DRV / m$ballotsCast
  m$DRV_TV <- 100 * m$DRV / m$totalVoters
  m$DEM_IDRV <- 100 * m$DEM / m$IDRV
  m$DEM_DRV <- 100 * m$DEM / m$DRV
  m$DEM_BC <- 100 * m$DEM / m$ballotsCast
  m$DEM_TV <- 100 * m$DEM / m$totalVoters
  m$REP_IDRV <- 100 * m$REP / m$IDRV
  m$REP_DRV <- 100 * m$REP / m$DRV
  m$REP_BC <- 100 * m$REP / m$ballotsCast
  m$REP_TV <- 100 * m$REP / m$totalVoters
  return(subset(m, DRV >= 0))
}

precinctLoader <- function(ym, type, county, ind) {
  r <- read.csv(paste("raw-csv/", ym, "_GA_",county,"_",type,"_precinct_usrep6_results.csv",sep=""), stringsAsFactors = F)
  t <- read.csv(paste("raw-csv/", ym, "_GA_",county,"_",type,"_precinct_turnout.csv",sep=""), stringsAsFactors = F)
  m <- merge(r,t,by=c("precinct"))
  m$COUNTY <- county
  m$PRECINCTS <- 1
  m <-addDetails(m,ind)
  m$DPW <- 0
  m$RPW <- 0
  m$IPW <- 0
  if (ind) {
#    m$DPW[(m$DEM > m$REP) && (m$DEM > m$IND)] <- 1
#    m$RPW[(m$REP > m$DEM) && (m$REP > m$IND)] <- 1
#    m$IPW[(m$IND > m$REP) && (m$IND > m$DEM)] <- 1
  } else {
    m$DPW[m$DEM > m$REP] <- 1
    m$RPW[m$REP > m$DEM] <- 1
  }
  return(m)
}

electionLoader <- function(ym, type, ind) {
  m <- rbind(
    precinctLoader(ym, type, "Cobb", ind),
    precinctLoader(ym, type, "DeKalb", ind),
    precinctLoader(ym, type, "Fulton",ind)
  )
  return(m)
}

countyAggregator <- function(list, ind) {
  m <- aggregate(. ~ COUNTY, data=list[-1], FUN=sum, na.action = na.omit)
  return(addDetails(m,ind))
}

resultsTransformer <- function(list, ym) {
  dCols <- c("COUNTY","totalVoters","PRECINCTS",
             "IDRV", "IDRV_TV", "IDRV_BC","IPW",
             "ballotsCast", "BC_TV",
             "DRV", "DRV_TV", "DRV_BC",
             "DEM", "DEM_IDRV", "DEM_DRV", "DEM_BC","DEM_TV", "DPW",
             "REP", "REP_IDRV", "REP_DRV", "REP_BC","REP_TV", "RPW")
  t <- list[dCols]
# colnames(t)[colnames(t)=="ballotsCast"] <- "BC"
# colnames(t)[colnames(t)=="totalVoters"] <- "TV"
  rownames(t) <- t$COUNTY
  t <- tFrame(t[-1])
  t$Total = 0
  t$DIV <- 3
  t$DIV[rownames(t) == "DEM"] = 1
  t$DIV[rownames(t) == "DPW"] = 1
  t$DIV[rownames(t) == "REP"] = 1
  t$DIV[rownames(t) == "RPW"] = 1
  t$DIV[rownames(t) == "DRV"] = 1
  t$DIV[rownames(t) == "BC"] = 1
  t$DIV[rownames(t) == "ballotsCast"] = 1
  t$DIV[rownames(t) == "IDRV"] = 1
  t$DIV[rownames(t) == "IPW"] = 1
  t$DIV[rownames(t) == "TV"] = 1
  t$DIV[rownames(t) == "totalVoters"]
  t$Total <- (t$Cobb + t$DeKalb + t$Fulton) / t$DIV
  t <- t[1:4]
  colnames(t) <- paste(colnames(t), ym, sep="_")
  t$KEY <- rownames(t)
  return(t)
}

pResults1611 <- electionLoader("1611", "general", FALSE)
cResults1611 <- countyAggregator(pResults1611, FALSE)
pResults1704 <- electionLoader("1704", "special", TRUE)
cResults1704 <- countyAggregator(pResults1704, TRUE)
pResults1706 <- electionLoader("1706", "special", FALSE)
cResults1706 <- countyAggregator(pResults1706, FALSE)

tResults1611 = resultsTransformer(cResults1611,"1611")
tResults1704 = resultsTransformer(cResults1704,"1704")
tResults1706 = resultsTransformer(cResults1706,"1706")

tResults = merge(merge(tResults1611, tResults1704),tResults1706)
rownames(tResults) <- tResults$KEY
tResults <- tResults[-1]


tResults[c(1,5,9)]
tResults[c(2,6,10)]
tResults[c(3,7,11)]
tResults[c(4,8,12)]

write.csv(pResults1611, file = "csv/1611_precints_results.csv")
write.csv(cResults1611, file = "csv/1611_county_results.csv")
write.csv(tResults1611, file = "csv/1611_county_summary.csv")
write.csv(pResults1704, file = "csv/1704_precints_results.csv")
write.csv(cResults1704, file = "csv/1704_county_results.csv")
write.csv(tResults1704, file = "csv/1704_county_summary.csv")
write.csv(pResults1706, file = "csv/1706_precints_results.csv")
write.csv(tResults1706, file = "csv/1706_county_summary.csv")
write.csv(tResults, file = "csv/summmary.csv")

write.csv(cResults1706, file = "csv/1706_county_results.csv")


