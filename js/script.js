const margin = { top: 120, right: 100, bottom: 160, left: 100 }, // Increased top margin for title
    width = 800 - margin.left - margin.right,  // Increased width
    height = 600 - margin.top - margin.bottom + 100; // Increased height

const svgMale = d3.select("#male-heatmap")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("display", "block")        // center horizontally
    .style("margin", "0 auto")        // center horizontally
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const svgFemale = d3.select("#female-heatmap")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("display", "block")        // center horizontally
    .style("margin", "0 auto")        // center horizontally
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

d3.tsv("data/merged_clean.tsv").then(data => {
    console.log("Raw data loaded:", data.slice(0, 5));

    // Convert strings to numbers
    const renamedData = data.map(d => ({
        gender: +d.GENDER_R,
        timesArrested: +d.NOBOOKY2,
        alcoholDays: +d.ALCDAYS,
        depressionFrequency: +d.DSTDEPRS
    }));

    // Split by gender
    const maleData = renamedData.filter(d => d.gender === 1);
    const femaleData = renamedData.filter(d => d.gender === 0);

    const yAxisValuesMale = Array.from(
        new Set(maleData.map(d => d.timesArrested).filter(v => v >= 0 && v <= 50)) // adjust upper limit if needed
    ).sort((a, b) => a - b);

    const yAxisValuesFemale = Array.from(
        new Set(femaleData.map(d => d.timesArrested).filter(v => v >= 0 && v <= 50))
    ).sort((a, b) => a - b);


    console.log("Sorted Male Times Arrested:", yAxisValuesMale);
    console.log("Sorted Female Times Arrested:", yAxisValuesFemale);

    // Create bins for both x and y axes
    const xAxisValues = Array.from(new Set(renamedData.map(d => d.alcoholDays)));

    // Draw heatmaps for both male and female
    drawHeatmap(svgMale, maleData, "Male", xAxisValues, yAxisValuesMale);
    drawHeatmap(svgFemale, femaleData, "Female", xAxisValues, yAxisValuesFemale);
});

function drawHeatmap(svg, dataset, label) {
    const xAxisValues = Array.from(new Set(dataset.map(d => d.alcoholDays))).sort((a, b) => a - b);  // Sort alcoholDays
    const yAxisValues = Array.from(new Set(dataset.map(d => d.timesArrested))).sort((a, b) => a - b); // Sort timesArrested

    const size = 500; // Increased size
    const cellSize = 40//size / Math.max(xAxisValues.length, yAxisValues.length); // Adjust cell size accordingly

    const correlations = [];

    // Create a grid of depressionFrequency values for each combination of timesArrested and alcoholDays
    yAxisValues.forEach((yVal) => {
        xAxisValues.forEach((xVal) => {
            const subset = dataset.filter(d => d.timesArrested === yVal && d.alcoholDays === xVal);
            const avgDepressionFrequency = d3.mean(subset.map(d => d.depressionFrequency)); // Use average depressionFrequency
            correlations.push({ x: xVal, y: yVal, value: avgDepressionFrequency });
        });
    });

    const colorScale = d3.scaleSequential(d3.interpolateRdBu)
        .domain([d3.min(correlations, d => d.value), d3.max(correlations, d => d.value)]);

    // Title with multiple lines to avoid overflow
    svg.append("text")
        .attr("x", width / 2 + margin.left)
        .attr("y", -50)  // Increased vertical positioning
        .attr("text-anchor", "middle")
        .text(`${label} - Arrests vs Alcohol Days (Depression Frequency)`);

    svg.selectAll("rect")
        .data(correlations)
        .enter()
        .append("rect")
        .attr("x", d => xAxisValues.indexOf(d.x) * cellSize + margin.left)
        .attr("y", d => yAxisValues.indexOf(d.y) * cellSize + margin.top)
        .attr("width", cellSize)
        .attr("height", cellSize)
        .style("fill", d => colorScale(d.value))
        .attr("class", "cell");

    // Add x-axis labels (alcoholDays)
    svg.selectAll(".label-x")
        .data(xAxisValues)
        .enter()
        .append("text")
        .attr("x", (d, i) => i * cellSize + cellSize / 2 + margin.left)
        .attr("y", yAxisValues.length * cellSize + margin.top + 20)
        .text(d => d)
        .attr("text-anchor", "start")
        .attr("transform", (d, i) => {
            const x = i * cellSize + cellSize / 2 + margin.left;
            const y = height + 20;
            return `rotate(45, ${x}, ${y})`;
        })
        .style("font-size", "12px")
        .attr("class", "axis-label");


    // Add y-axis labels (timesArrested)
    svg.selectAll(".label-y")
        .data(yAxisValues)
        .enter()
        .append("text")
        .attr("y", (d, i) => i * cellSize + margin.top + cellSize / 2)
        .attr("x", -40)
        .text(d => d)
        .attr("text-anchor", "end")
        .attr("alignment-baseline", "middle")
        .attr("class", "axis-label")
        .style("font-size", "12px"); // Adjust font size for readability


    // Define a linear gradient for the legend
    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
        .attr("id", `legend-gradient-${label}`)
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "100%").attr("y2", "0%");

    // Interpolate colors for gradient
    const minVal = d3.min(correlations, d => d.value);
    const maxVal = d3.max(correlations, d => d.value);
    const steps = 10;
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        gradient.append("stop")
            .attr("offset", `${t * 100}%`)
            .attr("stop-color", colorScale(minVal + t * (maxVal - minVal)));
    }
}

////////  Spiral Graph  /////////
const svgAlcohol = d3.select('#spiral-alcohol')
    .append('svg')
    .attr('width', 600)
    .attr('height', 600)
    .append('g')
    .attr('transform', `translate(${600 / 2},${600 / 2})`);

const svgMarijuana = d3.select('#spiral-mj')
    .append('svg')
    .attr('width', 600)
    .attr('height', 600)
    .append('g')
    .attr('transform', `translate(${600 / 2},${600 / 2})`);

const spiralArc = (fromRadius, toRadius, width, fromAngle, toAngle) => {
    const x1 = fromRadius * Math.sin(fromAngle);
    const y1 = fromRadius * -Math.cos(fromAngle);
    const x2 = (fromRadius + width) * Math.sin(fromAngle);
    const y2 = (fromRadius + width) * -Math.cos(fromAngle);
    const x3 = toRadius * Math.sin(toAngle);
    const y3 = toRadius * -Math.cos(toAngle);
    const x4 = (toRadius + width) * Math.sin(toAngle);
    const y4 = (toRadius + width) * -Math.cos(toAngle);
    return `
          M ${x1},${y1} 
          L ${x2},${y2} 
          A ${fromRadius},${fromRadius} 1 0 1 ${x4},${y4} 
          L ${x3},${y3}
          A ${fromRadius},${fromRadius} 0 0 0 ${x1},${y1}`;
};

function createVis(svg, maleCounts, femaleCounts, caseScale, labelPrefix) {
    const BASE_RADIUS = 30;
    const numSpins = 2;
    const segments = 30;
    const totalAngle = numSpins * Math.PI * 2;
    const radiusGrowthPerRad = 15;

    for (let day = 1; day <= 30; day++) {
        const angle = (day / segments) * totalAngle;
        const dayWidth = totalAngle / segments;

        const fromAngleM = angle - dayWidth / 4;
        const toAngleM = angle;
        const fromAngleF = angle;
        const toAngleF = angle + dayWidth / 4;

        const baseRadius = BASE_RADIUS + radiusGrowthPerRad * angle;

        // Male
        const heightM = caseScale(maleCounts[day]);
        const pathM = spiralArc(baseRadius, baseRadius, heightM, fromAngleM, toAngleM);

        svg.append('path')
            .attr('d', pathM)
            .style('fill', "steelblue")
            .style('opacity', 0.8)
            .on('mouseover', function (event) {
                d3.select("#tooltip")
                    .style("display", "block")
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 20) + "px")
                    .html(`<strong>${labelPrefix} - Male</strong><br><strong># Days Used:</strong> ${day}<br><strong>People:</strong> ${maleCounts[day]}`);
            })
            .on('mousemove', function (event) {
                d3.select("#tooltip")
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 20) + "px");
            })
            .on('mouseout', function () {
                d3.select("#tooltip").style("display", "none");
            });

        // Female
        const heightF = caseScale(femaleCounts[day]);
        const pathF = spiralArc(baseRadius, baseRadius, heightF, fromAngleF, toAngleF);

        svg.append('path')
            .attr('d', pathF)
            .style('fill', "palevioletred")
            .style('opacity', 0.8)
            .on('mouseover', function (event) {
                d3.select("#tooltip")
                    .style("display", "block")
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 20) + "px")
                    .html(`<strong>${labelPrefix} - Female</strong><br><strong>Day:</strong> ${day}<br><strong>People:</strong> ${femaleCounts[day]}`);
            })
            .on('mousemove', function (event) {
                d3.select("#tooltip")
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 20) + "px");
            })
            .on('mouseout', function () {
                d3.select("#tooltip").style("display", "none");
            });
    }
}


// Bar Chart: Justice Involvement by Drug Use
function drawBarGraph(data) {
    const drugs = [
        { name: "Cocaine", field: "COCEVER" },
        { name: "Crack", field: "CRKEVER" },
        { name: "Heroin", field: "HEREVER" },
        { name: "LSD", field: "LSD" },
        { name: "PCP", field: "PCP" },
        { name: "Ecstasy", field: "ECSTASY" }
    ];

    const results = [];

    drugs.forEach(drug => {
        const users = data.filter(d => +d[drug.field] === 1);
        const nonUsers = data.filter(d => +d[drug.field] === 0);

        const justiceInvolvement = d => (+d.BOOKED === 1 || +d.PROBATON === 1 || +d.PAROLREL === 1);

        const usersWithJustice = users.filter(justiceInvolvement);
        const nonUsersWithJustice = nonUsers.filter(justiceInvolvement);

        results.push({
            drug: drug.name,
            userJusticeRate: (usersWithJustice.length / users.length) * 100,
            nonUserJusticeRate: (nonUsersWithJustice.length / nonUsers.length) * 100
        });
    });

    const svg = d3.select("#vis")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x0 = d3.scaleBand()
        .domain(results.map(d => d.drug))
        .range([0, width])
        .paddingInner(0.2);

    const x1 = d3.scaleBand()
        .domain(["Users", "Non-Users"])
        .range([0, x0.bandwidth()])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(results, d => Math.max(d.userJusticeRate, d.nonUserJusticeRate)) * 1.1])
        .range([height, 0]);

    const color = d3.scaleOrdinal()
        .domain(["Users", "Non-Users"])
        .range(["firebrick", "lightblue"]);

    svg.append("g")
        .selectAll("g")
        .data(results)
        .enter()
        .append("g")
        .attr("transform", d => `translate(${x0(d.drug)},0)`)
        .selectAll("rect")
        .data(d => [
            { key: "Users", value: d.userJusticeRate },
            { key: "Non-Users", value: d.nonUserJusticeRate }
        ])
        .enter()
        .append("rect")
        .attr("x", d => x1(d.key))
        .attr("y", d => y(d.value))
        .attr("width", x1.bandwidth())
        .attr("height", d => height - y(d.value))
        .attr("fill", d => color(d.key));

    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x0))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-0.8em")
        .attr("dy", "-0.15em")
        .attr("transform", "rotate(-45)");

    // X axis label
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)  // Push below x-axis
        .text("Drug")
        .style("font-size", "16px");

    // Y axis label
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 20)  // Push to left side
        .text("Justice System Involvement (%)")
        .style("font-size", "16px");

    svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(y));

    const legend = svg.append("g")
        .attr("transform", `translate(${width - 120},0)`);

    legend.selectAll("rect")
        .data(["Used at least once in their lifetime", "Never used"])
        .enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", (d, i) => i * 20)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", d => color(d));

    legend.selectAll("text")
        .data(["Used at least once in their lifetime", "Never used"])
        .enter()
        .append("text")
        .attr("x", 20)
        .attr("y", (d, i) => i * 20 + 12)
        .text(d => d)
        .style("font-size", "12px");
}


function init() {
    d3.tsv("data/spiral_clean.tsv", d => ({
        day: +d.day,
        gender: +d.GENDER_R,
        alcoholUse: +d.ALCDAYS,
        marijuanaUse: +d.MJDAY30A
    })).then(data => {
        const maleAlcohol = Array(31).fill(0);
        const femaleAlcohol = Array(31).fill(0);
        const maleMJ = Array(31).fill(0);
        const femaleMJ = Array(31).fill(0);

        data.forEach(d => {
            if (d.alcoholUse >= 0 && d.alcoholUse <= 30) {
                if (d.gender === 1) maleAlcohol[d.alcoholUse]++;
                else femaleAlcohol[d.alcoholUse]++;
            }
            if (d.marijuanaUse >= 0 && d.marijuanaUse <= 30) {
                if (d.gender === 1) maleMJ[d.marijuanaUse]++;
                else femaleMJ[d.marijuanaUse]++;
            }
        });

        // Find shared max value
        const sharedMax = d3.max([
            d3.max(maleAlcohol.slice(1)),
            d3.max(femaleAlcohol.slice(1)),
            d3.max(maleMJ.slice(1)),
            d3.max(femaleMJ.slice(1))
        ]);

        const caseScale = d3.scaleLinear()
            .domain([0, sharedMax])
            .range([0, 80]);

        createVis(svgAlcohol, maleAlcohol, femaleAlcohol, caseScale, "Alcohol");
        createVis(svgMarijuana, maleMJ, femaleMJ, caseScale, "Marijuana");
    });

    d3.tsv("data/arrest_drug_clean.tsv").then(drawBarGraph);
}

window.addEventListener('load', init);
