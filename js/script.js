const margin = { top: 120, right: 100, bottom: 160, left: 100 },
    width = 800 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom + 100;

const svgMale = d3.select("#male-heatmap")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("display", "block")
    .style("margin", "0 auto")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const svgFemale = d3.select("#female-heatmap")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("display", "block")
    .style("margin", "0 auto")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

d3.tsv("data/merged_clean.tsv").then(data => {
    console.log("Raw data loaded:", data.slice(0, 5));

    const renamedData = data.map(d => ({
        gender: +d.GENDER_R,
        timesArrested: +d.NOBOOKY2,
        alcoholDays: +d.ALCDAYS,
        depressionFrequency: +d.DSTDEPRS
    }));

    const maleData = renamedData.filter(d => d.gender === 1);
    const femaleData = renamedData.filter(d => d.gender === 0);

    const yAxisValuesMale = Array.from(
        new Set(maleData.map(d => d.timesArrested).filter(v => v >= 0 && v <= 50))
    ).sort((a, b) => a - b);

    const yAxisValuesFemale = Array.from(
        new Set(femaleData.map(d => d.timesArrested).filter(v => v >= 0 && v <= 50))
    ).sort((a, b) => a - b);


    console.log("Sorted Male Times Arrested:", yAxisValuesMale);
    console.log("Sorted Female Times Arrested:", yAxisValuesFemale);

    const xAxisValues = Array.from(new Set(renamedData.map(d => d.alcoholDays)));

    drawHeatmap(svgMale, maleData, "Male", xAxisValues, yAxisValuesMale);
    drawHeatmap(svgFemale, femaleData, "Female", xAxisValues, yAxisValuesFemale);
});

function drawHeatmap(svg, dataset, label) {
    const xAxisValues = Array.from(new Set(dataset.map(d => d.alcoholDays))).sort((a, b) => a - b);
    const yAxisValues = Array.from(new Set(dataset.map(d => d.timesArrested))).sort((a, b) => a - b);

    const size = 500;
    const cellSize = 40

    const correlations = [];

    yAxisValues.forEach((yVal) => {
        xAxisValues.forEach((xVal) => {
            const subset = dataset.filter(d => d.timesArrested === yVal && d.alcoholDays === xVal);
            const avgDepressionFrequency = d3.mean(subset.map(d => d.depressionFrequency));
            correlations.push({ x: xVal, y: yVal, value: avgDepressionFrequency });
        });
    });

    const colorScale = d3.scaleSequential(d3.interpolateRdBu)
        .domain([d3.min(correlations, d => d.value), d3.max(correlations, d => d.value)]);

    svg.append("text")
        .attr("x", width / 2 + margin.left)
        .attr("y", -50)
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
        .style("font-size", "12px");

    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
        .attr("id", `legend-gradient-${label}`)
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "100%").attr("y2", "0%");

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

    for (let day = 1; day <= 30; day += 2) {
        const angle = (day / segments) * totalAngle;
        const radius = BASE_RADIUS + radiusGrowthPerRad * angle + 30;

        const x = radius * Math.sin(angle);
        const y = radius * -Math.cos(angle);

        svg.append('text')
            .attr('x', x)
            .attr('y', y)
            .text(day)
            .attr('text-anchor', 'middle')
            .attr('alignment-baseline', 'middle')
            .style('font-size', '12px')
            .style('font-weight', 'bold')
            .style('fill', 'black');

    }

}

////////////// Bar Chart: Justice Involvement by Drug Use //////////
function drawMovingBarGraph(data) {
    const drugs = [
        { name: "Heroin", field: "HEREVER" },
        { name: "Cocaine", field: "COCEVER" },
        { name: "Crack", field: "CRKEVER" },
        { name: "LSD", field: "LSD" },
        { name: "PCP", field: "PCP" },
        { name: "Ecstasy", field: "ECSTASY" }
    ];

    const results = drugs.map(drug => {
        const users = data.filter(d => +d[drug.field] === 1);
        const nonUsers = data.filter(d => +d[drug.field] === 0);
        const justiceInvolvement = d => (+d.BOOKED === 1 || +d.PROBATON === 1 || +d.PAROLREL === 1);

        return {
            drug: drug.name,
            userJusticeRate: users.length ? (users.filter(justiceInvolvement).length / users.length) * 100 : 0,
            nonUserJusticeRate: nonUsers.length ? (nonUsers.filter(justiceInvolvement).length / nonUsers.length) * 100 : 0
        };
    });

    const svg = d3.select("#vis-moving")
        .append("svg")
        .attr("width", 900)
        .attr("height", 400)
        .append("g")
        .attr("transform", "translate(150,50)");

    const y = d3.scaleLinear()
        .domain([0, 100])
        .range([300, 0]);

    const x = d3.scaleBand()
        .domain(["Never Used", "Used"])
        .range([0, 300])
        .padding(0.4);

    const color = d3.scaleOrdinal()
        .domain(["Never Used", "Used"])
        .range(["lightblue", "firebrick"]);

    svg.append("g")
        .attr("transform", "translate(0,300)")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("font-size", "13px")
        .style("font-weight", "bold");


    svg.append("g")
        .call(d3.axisLeft(y));

    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -150)
        .attr("y", -40)
        .text("(%) Who Have Been Arrested / Probation / Parole")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("fill", "black");

    const legend = svg.append("g")
        .attr("transform", "translate(350, 30)");

    legend.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", "lightblue");

    legend.append("text")
        .attr("x", 20)
        .attr("y", 12)
        .text("Never used this substance in their life")
        .style("font-size", "12px")
        .style("font-weight", "bold");

    legend.append("rect")
        .attr("x", 0)
        .attr("y", 30)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", "firebrick");

    legend.append("text")
        .attr("x", 20)
        .attr("y", (d, i) => i * 20 + 12)
        .text(d => d)
        .style("font-size", "12px");
}

function drawScatterPlot(data) {
    const scatterMargin = { top: 20, right: 30, bottom: 30, left: 40 };
    const scatterWidth = 800 - scatterMargin.left - scatterMargin.right;
    const scatterHeight = 400 - scatterMargin.top - scatterMargin.bottom;

    const svgScatter = d3.select("#scatter-plot")
        .append("svg")
        .attr("width", scatterWidth + scatterMargin.left + scatterMargin.right)
        .attr("height", scatterHeight + scatterMargin.top + scatterMargin.bottom)
        .append("g")
        .attr("transform", `translate(${scatterMargin.left},${scatterMargin.top})`);

    const xScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.NOBOOKY2)])
        .range([0, scatterWidth]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.ASDSOVRL)])
        .range([scatterHeight, 0]);

    svgScatter.append("g")
        .attr("transform", `translate(0,${scatterHeight})`)
        .call(d3.axisBottom(xScale).ticks(10));

    svgScatter.append("g")
        .call(d3.axisLeft(yScale).ticks(10));

    svgScatter.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.NOBOOKY2))
        .attr("cy", d => yScale(d.ASDSOVRL))
        .attr("r", 5)
        .attr("fill", d => d.HLTINMNT === "1" ? "steelblue" : "orange")
        .attr("opacity", 0.7)
        .on("mouseover", function (event, d) {
            d3.select("#tooltip")
                .style("display", "block")
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px")
                .html(`Times Arrested: ${d.NOBOOKY2}<br>Depression Intensity: ${d.ASDSOVRL}<br>Treatment Status: ${d.HLTINMNT === "1" ? "Received Treatment" : "No Treatment"}`);
        })
        .on("mousemove", function (event) {
            d3.select("#tooltip")
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", function () {
            d3.select("#tooltip").style("display", "none");
        });

    // Title
    svgScatter.append("text")
        .attr("x", scatterWidth / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .text("Depression Intensity vs. Times Arrested")
        .style("font-size", "16px");
}


// function drawBoxPlot(data) {
//     const boxMargin = { top: 20, right: 30, bottom: 30, left: 40 };
//     const boxWidth = 800 - boxMargin.left - boxMargin.right;
//     const boxHeight = 400 - boxMargin.top - boxMargin.bottom;

//     const svgBox = d3.select("#box-plot")
//         .append("svg")
//         .attr("width", boxWidth + boxMargin.left + boxMargin.right)
//         .attr("height", boxHeight + boxMargin.top + boxMargin.bottom)
//         .append("g")
//         .attr("transform", `translate(${boxMargin.left},${boxMargin.top})`);

//     // Prepare data for box plot

//     var treatmentGroups = d3.group(data, d => d.HLTINMNT);


//     const yScale = d3.scaleLinear()
//         .domain([0, d3.max(data, d => d.DSTDEPRS)]) // Depression frequency score
//         .range([boxHeight, 0]);

//     // Add y-axis
//     svgBox.append("g")
//         .call(d3.axisLeft(yScale).ticks(10));

//     // Create box plots for each treatment group
//     treatmentGroups.forEach((group, i) => {
//         const groupData = group.map(d => d.DSTDEPRS);
//         console.log(groupData);

//         // Calculate quartiles
//         const q1 = d3.quantile(groupData, 0.25);
//         const median = d3.quantile(groupData, 0.5);
//         const q3 = d3.quantile(groupData, 0.75);
//         const iqr = q3 - q1; // Interquartile range
//         const min = d3.min(groupData.filter(d => d >= (q1 - 1.5 * iqr))); // Lower whisker
//         const max = d3.max(groupData.filter(d => d <= (q3 + 1.5 * iqr))); // Upper whisker

//         // Create a group for each box plot
//         const boxGroup = svgBox.append("g")
//             .attr("transform", `translate(${i * 100 + 50},0)`); // Position boxes

//         // Draw the box
//         boxGroup.append("rect")
//             .attr("x", -20)
//             .attr("y", yScale(q3))
//             .attr("height", yScale(q1) - yScale(q3))
//             .attr("width", 40)
//             .attr("fill", "lightblue")
//             .attr("stroke", "black");

//         // Draw the median line
//         boxGroup.append("line")
//             .attr("x1", -20)
//             .attr("x2", 20)
//             .attr("y1", yScale(median))
//             .attr("y2", yScale(median))
//             .attr("stroke", "black");

//         // Draw the whiskers
//         boxGroup.append("line")
//             .attr("x1", 0)
//             .attr("x2", 0)
//             .attr("y1", yScale(min))
//             .attr("y2", yScale(q1))
//             .attr("stroke", "black");

//         boxGroup.append("line")
//             .attr("x1", 0)
//             .attr("x2", 0)
//             .attr("y1", yScale(q3))
//             .attr("y2", yScale(max))
//             .attr("stroke", "black");

//         // Add labels
//         boxGroup.append("text")
//             .attr("x", 0)
//             .attr("y", boxHeight + 20)
//             .attr("text-anchor", "middle")
//             .text(group.key === "1" ? "Received Treatment" : "No Treatment");
//     });

//     // Title
//     svgBox.append("text")
//         .attr("x", boxWidth / 2)
//         .attr("y", -10)
//         .attr("text-anchor", "middle")
//         .text("Box Plot of Depression Frequency by Treatment Status")
//         .style("font-size", "16px");
// }
// function drawBoxPlot(data) {
//     const boxMargin = { top: 20, right: 30, bottom: 30, left: 40 };
//     const boxWidth = 800 - boxMargin.left - boxMargin.right;
//     const boxHeight = 400 - boxMargin.top - boxMargin.bottom;

//     const svgBox = d3.select("#box-plot")
//         .append("svg")
//         .attr("width", boxWidth + boxMargin.left + boxMargin.right)
//         .attr("height", boxHeight + boxMargin.top + boxMargin.bottom)
//         .append("g")
//         .attr("transform", `translate(${boxMargin.left},${boxMargin.top})`);

//     // Prepare data for box plot
//     const treatmentGroups = d3.group(data, d => d.HLTINMNT);

//     const yScale = d3.scaleLinear()
//         .domain([1,5])
//         .range([boxHeight, 0]);

//     // Add y-axis
//     svgBox.append("g")
//         .call(d3.axisLeft(yScale).ticks(10));

//     const filteredGroups = Array.from(treatmentGroups.entries()).filter(
//             ([key, _]) => key === "1" || key === "2" || key === 1 || key === 2
//         );

//     // Create box plots for each treatment group
//     filteredGroups.forEach(([key, groupData], i) => {
//         //const depressionScores = groupData.map(d => d.DSTDEPRS);
//         const depressionScores = groupData
//         .map(d => d.DSTDEPRS)
//         .filter(d => d >= 1 && d <= 5);

//     //print out group data


//         // Calculate quartiles
//         const q1 = d3.quantile(depressionScores, 0.25);
//         const median = d3.quantile(depressionScores, 0.5);
//         console.log(median);
//         const q3 = d3.quantile(depressionScores, 0.75);
//         const iqr = q3 - q1;
//         const min = d3.min(depressionScores.filter(d => d >= (q1 - 1.5 * iqr)));
//         const max = d3.max(depressionScores.filter(d => d <= (q3 + 1.5 * iqr)));

//         // Create a group for each box plot
//         const boxGroup = svgBox.append("g")
//             .attr("transform", `translate(${i * 150 + 100},0)`); // Adjust spacing between boxes


//         // Draw the box
//         boxGroup.append("rect")
//             .attr("x", -20)
//             .attr("y", yScale(q3))
//             .attr("height", yScale(q1) - yScale(q3))
//             .attr("width", 40)
//             .attr("fill", "lightblue")
//             .attr("stroke", "black");

//         // Draw the median line
//         boxGroup.append("line")
//             .attr("x1", -20)
//             .attr("x2", 20)
//             .attr("y1", yScale(median))
//             .attr("y2", yScale(median))
//             .attr("stroke", "red");

//         // Draw the whiskers
//         boxGroup.append("line")
//             .attr("x1", 0)
//             .attr("x2", 0)
//             .attr("y1", yScale(min))
//             .attr("y2", yScale(q1))
//             .attr("stroke", "black");

//         boxGroup.append("line")
//             .attr("x1", 0)
//             .attr("x2", 0)
//             .attr("y1", yScale(q3))
//             .attr("y2", yScale(max))
//             .attr("stroke", "black");

//         // Add labels
//         boxGroup.append("text")
//             .attr("x", 0)
//             .attr("y", boxHeight + 20)
//             .attr("text-anchor", "middle")
//             .text(key === "1" ? "difficulties" : "NO difficulties");
//     });

//     // Title
//     svgBox.append("text")
//         .attr("x", boxWidth / 2)
//         .attr("y", -10)
//         .attr("text-anchor", "middle")
//         .text("Box Plot of Depression Frequency by Treatment Status")
//         .style("font-size", "16px");
// }

////////////// Bar Chart: Justice Involvement by Drug Use //////////
function drawMovingBarGraph(data) {
    const drugs = [
        { name: "Heroin", field: "HEREVER" },
        { name: "Cocaine", field: "COCEVER" },
        { name: "Crack", field: "CRKEVER" },
        { name: "LSD", field: "LSD" },
        { name: "PCP", field: "PCP" },
        { name: "Ecstasy", field: "ECSTASY" }
    ];

    const results = drugs.map(drug => {
        const users = data.filter(d => +d[drug.field] === 1);
        const nonUsers = data.filter(d => +d[drug.field] === 0);
        const justiceInvolvement = d => (+d.BOOKED === 1 || +d.PROBATON === 1 || +d.PAROLREL === 1);

        return {
            drug: drug.name,
            userJusticeRate: users.length ? (users.filter(justiceInvolvement).length / users.length) * 100 : 0,
            nonUserJusticeRate: nonUsers.length ? (nonUsers.filter(justiceInvolvement).length / nonUsers.length) * 100 : 0
        };
    });

    const svg = d3.select("#vis-moving")
        .append("svg")
        .attr("width", 800)
        .attr("height", 400)
        .append("g")
        .attr("transform", "translate(150,50)");

    const y = d3.scaleLinear()
        .domain([0, 100])
        .range([300, 0]);

    const x = d3.scaleBand()
        .domain(["Never Used", "Used"])
        .range([0, 300])
        .padding(0.4);

    const color = d3.scaleOrdinal()
        .domain(["Never Used", "Used"])
        .range(["lightblue", "firebrick"]);

    svg.append("g")
        .attr("transform", "translate(0,300)")
        .call(d3.axisBottom(x).tickFormat(''))
        .selectAll("text")
        .style("font-size", "13px")
        .style("font-weight", "bold");

    svg.append("g")
        .call(d3.axisLeft(y));

    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -150)
        .attr("y", -40)
        .text("% With Criminal History")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("fill", "black");

    const legend = svg.append("g")
        .attr("transform", "translate(350, 10)");

    legend.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", "lightblue");

    legend.append("text")
        .attr("x", 20)
        .attr("y", 12)
        .text("Never used this substance in their life")
        .style("font-size", "12px")
        .style("font-weight", "bold");

    legend.append("rect")
        .attr("x", 0)
        .attr("y", 30)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", "firebrick");

    legend.append("text")
        .attr("x", 20)
        .attr("y", 42)
        .text("Used this substance at least once in their life")
        .style("font-size", "12px")
        .style("font-weight", "bold");

    const drugTitle = svg.append("text")
        .attr("x", 150)
        .attr("y", 10)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("font-weight", "bold")
        .text("");

    let currentIndex = 0;

    function update() {
        const drug = results[currentIndex];

        drugTitle.text(drug.drug);

        const barData = [
            { group: "Never Used", value: drug.nonUserJusticeRate },
            { group: "Used", value: drug.userJusticeRate }
        ];

        const bars = svg.selectAll(".bar")
            .data(barData, d => d.group);

        bars.enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => x(d.group))
            .attr("width", x.bandwidth())
            .attr("y", y(0))
            .attr("height", d => 300 - y(0))
            .attr("fill", d => color(d.group))
            .merge(bars)
            .transition()
            .duration(1000)
            .attr("y", d => y(d.value))
            .attr("height", d => 300 - y(d.value));

        bars.exit().remove();

        const labels = svg.selectAll(".bar-label")
            .data(barData, d => d.group);

        labels.enter()
            .append("text")
            .attr("class", "bar-label")
            .attr("x", d => x(d.group) + x.bandwidth() / 2)
            .attr("y", y(0) - 5)
            .text(d => `${d.value.toFixed(1)}%`)
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .style("fill", "black")
            .merge(labels)
            .transition()
            .duration(1000)
            .attr("y", d => y(d.value) - 5)
            .tween("text", function (d) {
                const that = d3.select(this);
                const i = d3.interpolateNumber(parseFloat(that.text()), d.value);
                return function (t) {
                    that.text(i(t).toFixed(1) + "%");
                };
            });

        labels.exit().remove();
    }

    update();

    setInterval(() => {
        currentIndex = (currentIndex + 1) % results.length;
        update();
    }, 3000);
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

    d3.tsv("data/arrest_drug_clean.tsv").then(drawMovingBarGraph);

    d3.tsv("data/merged_clean.tsv").then(data => {
        const renamedData = data.map(d => ({
            gender: +d.GENDER_R,
            timesArrested: +d.NOBOOKY2,
            alcoholDays: +d.ALCDAYS,
            depressionFrequency: +d.DSTDEPRS,
            ASDSOVRL: +d.ASDSOVRL,
            HLTINMNT: d.HLTINMNT
        }));

        d3.tsv("data/cleaned_depression_data.tsv").then(drawScatterPlot);
        d3.tsv("data/cleaned_depression_data.tsv").then(drawBoxPlot);
    });
}


window.addEventListener('load', init);