---
title: "Atmospheric Conditions Don't Make It Rain, Bikes Do"
date: 2020-01-12T16:52:56+01:00
draft: true
tags: [GoogleCloudPlatform, AppEngine, BigQuery, DataStudio]
---

My apartment is close to a city’s self service bike renting station. Every day when I walk to work, I pass by the station.
At the beginning I didn’t really pay attention, but then I started noticing something. The station is empty when the weather is good and, at the opposite, all bikes are available when it is rainy.

An empty bike station on a beautiful sunny day.

![Empty bike station](/img/toulouse_velib_empty_station.jpeg)

The first time, I said « this is odd », but after a while it was clear to me that there was a pattern.
One way or another, I was going to make this clear.

## The battle plan

I decided to start collecting data.
Luckily, the company that manages the bikes also offers free access to an open data API. The API provides near real time information about the stations, like how many bike stands there are, or how many bikes are available.
As for the weather, I found this service called OpenWeatherMap which seemed to do the job and be fairly easy to use.

My plan was to periodically call these APIs, store the data for each call, and use some visualization tool in order to highlight the suspected correlation.

I wanted to use Google BigQuery for storing the data. BigQuery is a serverless solution for data warehouse. It offers great scalability, SQL querying and analyzing capabilities, all that with a pay-for-what-you-use pricing model.
BigQuery also easily interoperates with multiple dashboard solutions like Grafana or Data Studio. I was eventually going to use Data Studio as I wanted a fully managed solution.

For data harvesting, I had to write some code. I decided to host it on Google Cloud Functions, which is a fully managed serverless computing solution on Google Cloud Platform. It is arguably the fastest way to get a piece of code running there.
Publishing one function for weather data harvesting, and another one for stations data harvesting using the Go runtime of Google Cloud Functions seemed to be a reasonable amount of work.
The functions can be triggered with a HTTP call on a dynamically generated URL. So the last piece of the puzzle had to be Google Cloud Scheduler, which can periodically call the harvesting functions.

![System architecture schema](/img/bikes_stats_architecture_schema.png)

## Preparing the BigQuery dataset and tables

For using GCP, I needed a to create a new project and give it a unique identifier. So I did and stored the project id in an environment variable.

```bash
export GCP_PROJECT_ID=my-awesome-project
```

BigQuery makes you organize your data tables into datasets. I created one called `bikes_stats`, using `bq` which is a command line tool for BigQuery. The same can be achieved using the web console.

```bash
bq --location=eu --project_id=$GCP_PROJECT_ID mk bikes_stats
```

### The weather table

Still using `bq`, I created the two tables.
This first command creates the `weather` table.

```bash
bq mk --project_id=$GCP_PROJECT_ID bikes_stats.weather \
  ObservationTime:TIMESTAMP,Temperature:FLOAT64,TemperatureFeelsLike:FLOAT64,HumidityPercentage:FLOAT64,Precipitation:FLOAT64
```

The below table offers a better view of the fields that the cloud function will fill.

| Field name           | BigQuery type | Description                                    |
|----------------------|---------------|------------------------------------------------|
| ObservationTime      | TIMESTAMP     | When the data is fetched from the external API |
| Temperature          | FLOAT64       | The measured temperature in °C                 |
| TemperatureFeelsLike | FLOAT64       | What the temperature feels like in °C          |
| HumidityPercentage   | FLOAT64       | The humidity percentage                        |
| Precipitation        | FLOAT64       | The precipitation measured in mm               |

The weather API provides more detail in the report, but all of them are obviously not needed for this use case.

### The stations table

Now for the `stations` table, using `bq` again.

```bash
bq mk --project_id=$GCP_PROJECT_ID bikes_stats.stations \
  ObservationTime:TIMESTAMP,Name:STRING,BikeStands:INT64,AvailableBikeStands:INT64,AvailableBikes:INT64
```

Here is the same table.

| Field name          | BigQuery type | Description                                                       |
|---------------------|---------------|-------------------------------------------------------------------|
| ObservationTime     | TIMESTAMP     | When the data is fetched from the external API                    |
| Name                | STRING        | The name of the bike station                                      |
| BikeStands          | INT64         | The total number of bike stands that the station has              |
| AvailableBikeStands | INT64         | The number of bike stands that are available for returning a bike |
| AvailableBikes      | INT64         | The number of available bikes in the station                      |

Again, the cloud function will ignore some other fields that are not required.

## Reviewing the functions source code

### The Weather function

We will just take a quick overview of what the function does.
As I mentioned earlier the code is written in Go, which should be quite easy to read.
I should mention though, that for those of you who never used or read code in Go, I made a few simplifications for you not to be too distracted by the language specifics. Follow the link to the Github repository if you want to read to actual version.

```go
package functions

import (
	"net/http"
	"os"
	"time"

	"cloud.google.com/go/bigquery"
	"github.com/aubm/bikes_stats/functions/weather"
)

const (
	bigQueryDatasetID = "bikes_stats"
	bigQueryTableID   = "weather"
)

// Weather is the API entry point of the Cloud Function, called when a request
// is performed to the service.
// The function implements the well known go standard library's http.HandlerFunc
// interface. Therefore, request details are accessible through the r input
// parameter and the w input parameter is of type http.ResponseWriter, which
// can modify the HTTP response sent to the client.
func Weather(w http.ResponseWriter, r *http.Request) {
  // The OpenWeatherMap API key is generated from my account, and provided
  // as an environment variable at deployment time.
	apiKey := os.Getenv("OPEN_WEATHER_MAP_API_KEY")

  //
	gcpProject := os.Getenv("GCP_PROJECT")

	currentWeather, err := weather.Current(apiKey)
	if err != nil {
		panic(err)
	}

	client, err := bigquery.NewClient(gcpProject)
	if err != nil {
		panic(err)
	}

	u := client.Dataset(datasetID).Table(tableID).Inserter()

	if err := u.Put(Item{
		ObservationTime:      time.Now(),
		Temperature:          currentWeather.Temperature,
		TemperatureFeelsLike: currentWeather.TemperatureFeelsLike,
		HumidityPercentage:   currentWeather.HumidityPercentage,
		Precipitation:        currentWeather.Precipitation,
	}); err != nil {
		panic(err)
	}
}

type BQItem struct {
	ObservationTime      time.Time
	Temperature          float64 // °C
	TemperatureFeelsLike float64 // °C
	HumidityPercentage   float64
	Precipitation        float64 // mm
}
```

```bash
gcloud functions deploy Weather \
  --runtime go111 \
  --trigger-http \
  --allow-unauthenticated \
  --region=europe-west1 \
  --project=adventure-app-230618 \
  --set-env-vars=OPEN_WEATHER_MAP_API_KEY=xxx
```
// TODO: remove --allow-unauthenticated ?

## Creating the dashboard with Data Studio

## Conclusion

Meteorologists have it all wrong. All this time we thought that complex atmospheric conditions were the reason why rain happens.
The truth is really simpler.
