const url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json';

let values = [];
let baseTemp;

let xScale;
let yScale;

let width = 1200;
let height = 600;
let padding = 60;

let minYear;
let maxYear;

let canvas = d3.select('#canvas');
canvas.attr('width', width);
canvas.attr('height', height);

function generateScales () {
    minYear = d3.min(values, (item) => {
        return item['year']
    });

    maxYear = d3.max(values, (item) => {
        return item['year']
    });

    xScale = d3.scaleTime() // or scaleLinear, does not make diff
                .domain([minYear, maxYear + 1])
                .range([padding, width - padding])

    yScale = d3.scaleTime()
                .domain([new Date(0,0,0,0,0,0,0), new Date(0,12,0,0,0,0,0)])
                .range([padding, height - padding]);
}

function drawCells () {
    canvas.selectAll('rect')
            .data(values)
            .enter()
            .append('rect')
            .attr('class', 'cell')
            // assigning colors to cells
            .attr('fill', (item) => {
                let variance = item['variance'];

                if(variance <= -1) {
                    return 'Blue'
                } else if(variance <= 0) {
                    return 'Lightblue'
                } else if(variance <= 1) {
                    return 'Orange'
                } else {
                    return 'Red'
                }
            })
            .attr('data-year', (item) => {
                return item['year'];
            })
            .attr('data-month', (item) => {
                return item['month'] - 1;
            })
            .attr('data-temp', (item) => {
                return baseTemp + item['variance'];
            })
            // height will be the height - 2x padding and devided into number of cells vertically
            .attr('height', (height - (2 * padding))/12)
            // take the month from data, convert it into a Date, feed into yScale
            .attr('y', (item) => {
                return yScale(new Date(0, item['month'] - 1, 0, 0, 0, 0, 0))
            })
            // width will be total width - 2x padding and devided into number of cells horizontally
            .attr('width', (item) => {
                // calculate the number of cells horizontally
                let numberOfYears = maxYear - minYear;
                return (width - (2 * padding))/ numberOfYears;
            })
            .attr('x', (item) => {
                return xScale(item['year'])
            })



}

function drawAxis () {
    let xAxis = d3.axisBottom(xScale)
                    .tickFormat(d3.format('d'));

    canvas.append('g')
            .call(xAxis)
            .attr('id', 'x-axis')
            .attr('transform', 'translate(0, ' + (height - padding) + ')')

    let yAxis = d3.axisLeft(yScale)
                    .tickFormat(d3.timeFormat('%B'))

    canvas.append('g')
            .call(yAxis)
            .attr('id', 'y-axis')
            .attr('transform', 'translate(' + padding + ', 0)')

}

// getting data and drawing the heatmap
const req = new XMLHttpRequest();
req.open('GET', url, true);
req.onload = function () {
    let data = JSON.parse(req.response);
    baseTemp = data['baseTemperature'];
    values = data['monthlyVariance'];
    console.log(baseTemp);
    console.log(values);

    generateScales();
    drawCells();
    drawAxis();
}
req.send();