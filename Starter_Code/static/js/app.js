// read in samples.json using d3
const url = "https://static.bc-edx.com/data/dl-1-2/m14/lms/starter/samples.json"


// assign the first 20 ids to a variable
function populateDropdown(samples) {
    let top20 = [];
    let metaData = [];
	
    //loop through sample json and populate metaData
    for (i = 0; i < 20; i++) {
        let data = samples["samples"][i];
        let meta = samples["metadata"][i];
        top20.push(data);
        metaData.push(meta);
    }

    //Add the IDs to the dropdown selector
    let selector = d3.select("#selDataset");
    let opts = selector.selectAll(null)
        .data(top20.sort())
        .enter()
        .append('option')
        .attr('value', function (d) {
          return d.id;
        })
        .text(function (d) {
          return d.id;
        });
}
		
//change dats when dropdown is selected
function optionChanged(id) {
  console.log("Selected ID:", id);
	
	d3.json(url).then(function (data) {
		let selectedSample= data.samples.find(function (sample) {
				return sample.id === id;
		});
			
		if (selectedSample) {
			console.log("Selected Sample Data:", selectedSample);
			updateBarChart(selectedSample);
			updateBubbleChart(selectedSample);
			metadata(id);
		} else {
			console.log("Sample not found for ID:", id);
		}
	}).catch(function (error) {
		console.log("Error loading JSON:", error);
	});
}

//create bar chart 
function updateBarChart(patient) {
	
	let	trace1 = {
		x: patient.sample_values.slice(0, 10).reverse(),
		y: patient["otu_ids"].slice(0, 10).map(label => "OTU " + label).reverse(),
		type: 'bar',
		orientation: 'h',
//text: sample_values.slice(0, 10).map(value => ('${value.toFixed(2)} ${value >= 4.17 ? "above" : "below"} the mean')),
		marker: {color: 'rgb(142,124,195)'}
	};


	let data = [trace1];

	let layout = {
		title: 'Top 10 Bacteria Cultures Found',
		font:{
			family: 'Raleway, sans-serif'
		},
		showlegend: false,
		xaxis: {
			title: 'Sample Values',
		},
		yaxis: {
			title: 'OTU ID',
			zeroline: false,
			gridwidth: 2
		},
		bargap :0.05
	};

	Plotly.newPlot('myDiv', data, layout);
}

//create bubble chart
function updateBubbleChart(patient) {
	let bubbleTrace = {
		x: patient.otu_ids,
		y: patient.sample_values,
		mode: 'markers',
		marker: {
			color: patient.otu_ids,
			colorscale: 'Earth',
			sizemode: 'area',
			opacity: [1, 0.8, 0.6, 0.4],
			size: patient.sample_values
		}
	};

	let bubbleData = [bubbleTrace];

	let  bubbleLayout = {
		title: 'Bacteria Cultures Per Sample',
		xaxis: {title: 'OTU ID' },
		yaxis: {title: 'Sample Values' }
	};
	
	Plotly.newPlot('bubbleDiv', bubbleData, bubbleLayout);
}

//show metadata
function metadata(id) {
    d3.json(url).then(function (data) {
      //  Get data from metadata
      let metadata = data.metadata;
      // Loop through metadata to find matching id
      let resultArray = metadata.filter(sampleObj => sampleObj.id == id);
      let result = resultArray[0];
      // Clear output
      let sampleMetadataPanel = d3.select("#sample-metadata");
      sampleMetadataPanel.html("");
      for (key in result) {
        sampleMetadataPanel.append("p").text(`${key}: ${result[key]}`);
      }
    });
  }
		
//Load JSON data and populate dropdown menu
d3.json(url).then(function(samples) {
	console.log("Loaded samples", samples);
	metadata(samples.samples[0].id);
	populateDropdown(samples);


	updateBarChart(samples.samples[0]);
	updateBubbleChart(samples.samples[0]);
}).catch(function (error) {
	console.log("Error loading JSON:", error);
});