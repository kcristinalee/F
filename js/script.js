const margin = { top: 120, right: 100, bottom: 160, left: 100 },
    width = 900 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom + 100;


////////  Heat Maps /////////
const xAxisLabels = {
    alcoholDays: "Consumed Alcohol",
    chewDays: "Chewed Tobacco",
    marijuanaDays: "Consumed Marijuana",
    workDaysMissed: "Work Days Missed"
};

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

    const renamedData = data.map(d => {

        let alcoholDays = +d.ALCDAYS;
        if (alcoholDays === 91) {
            alcoholDays = 0;
        } else if ([93, 94, 97, 98, 99].includes(alcoholDays)) {
            alcoholDays = null;
        }

        let chewDays = +d.CHW30USE;
        if (chewDays === 91) {
            chewDays = 0;
        } else if ([93, 94, 97, 98, 99].includes(chewDays)) {
            chewDays = null;
        }

        let marijuanaDays = +d.MJDAY30A;
        if (marijuanaDays === 91) {
            marijuanaDays = 0;
        } else if ([93, 94, 97, 98, 99].includes(marijuanaDays)) {
            marijuanaDays = null;
        }

        let workDaysMissed = +d.WORKDAYS;
        if (workDaysMissed === 91) {
            workDaysMissed = 0;
        } else if ([93, 94, 97, 98, 99].includes(workDaysMissed)) {
            workDaysMissed = null;
        }

        let depressionFrequency = +d.DSTDEPRS;
        if (depressionFrequency === 91) {
            depressionFrequency = 0;
        } else if ([93, 94, 97, 98, 99].includes(depressionFrequency)) {
            depressionFrequency = null;
        }

        return {
            gender: +d.GENDER_R,
            timesArrested: +d.NOBOOKY2,
            alcoholDays: alcoholDays !== null && alcoholDays >= 0 && alcoholDays <= 30 ? group(alcoholDays) : null,
            chewDays: chewDays !== null && chewDays >= 0 && chewDays <= 30 ? group(chewDays) : null,
            marijuanaDays: marijuanaDays !== null && marijuanaDays >= 0 && marijuanaDays <= 30 ? group(marijuanaDays) : null,
            workDaysMissed: workDaysMissed !== null && workDaysMissed >= 0 && workDaysMissed <= 30 ? group(workDaysMissed) : null,
            depressionFrequency: +d.DSTDEPRS
        };
    });


    const maleData = renamedData.filter(d => d.gender === 1);
    const femaleData = renamedData.filter(d => d.gender === 0);

    // Define the x-axis options
    const xAxisOptions = ["alcoholDays", "chewDays", "marijuanaDays", "workDaysMissed"];


    const dropdown = d3.select("#dropdownId");

    dropdown.on("change", function () {
        const selectedX = dropdown.property("value");  // Using D3 to access the value
        console.log("Dropdown value changed:", selectedX);
        updateHeatmaps(selectedX);
    });

    // Add options
    dropdown.selectAll("option")
        .data(xAxisOptions)
        .enter()
        .append("option")
        .text(d => d)
        .attr("value", d => d);

    // Save globally (so updateHeatmaps can access)
    window.maleData = maleData;
    window.femaleData = femaleData;

    drawHeatmap(svgMale, maleData, "Male", "alcoholDays");
    drawHeatmap(svgFemale, femaleData, "Female", "alcoholDays");
});

function updateHeatmaps(selectedX) {
    console.log("Selected X:", selectedX);
    svgMale.selectAll("*").remove();
    svgFemale.selectAll("*").remove();
    drawHeatmap(svgMale, window.maleData, "Male", selectedX);
    drawHeatmap(svgFemale, window.femaleData, "Female", selectedX);
}

function drawHeatmap(svg, dataset, label, selectedX) {

    const desiredOrder = ["0", "1-5", "6-10", "11-15", "16-20", "21-25", "26-30"];

    const xAxisValues = Array.from(new Set(dataset
        .map(d => d[selectedX])
        .filter(v => v !== null)
    )).sort((a, b) => desiredOrder.indexOf(a) - desiredOrder.indexOf(b));


    const yAxisValues = Array.from(
        new Set(dataset.map(d => d.timesArrested).filter(v => v >= 0 && v <= 50))
    ).sort((a, b) => a - b);

    //console.log("1:", xAxisValues);

    const size = 500;
    const cellSize = 40

    const correlations = [];

    yAxisValues.forEach((yVal) => {
        xAxisValues.forEach((xVal) => {
            const subset = dataset.filter(d => d.timesArrested === yVal && d[selectedX] === xVal);
            const avgDepressionFrequency = d3.mean(subset.map(d => d.depressionFrequency));
            correlations.push({ x: xVal, y: yVal, value: avgDepressionFrequency });
        });
    });

    const colorScale = d3.scaleSequential(d3.interpolateRdBu)
        .domain([d3.max(correlations, d => d.value), d3.min(correlations, d => d.value)]);

    svg.append("text")
        .attr("x", width / 2 + margin.left - 120)
        .attr("y", -50)
        .attr("text-anchor", "middle")
        .text(`${label} - Arrests vs ${xAxisLabels[selectedX]} (Depression Frequency)`)
        .style("font-size", "30px");

    svg.selectAll("rect")
        .data(correlations)
        .enter()
        .append("rect")
        .attr("x", d => xAxisValues.indexOf(d.x) * cellSize + margin.left)
        .attr("y", d => yAxisValues.indexOf(d.y) * cellSize + margin.top)
        .attr("width", cellSize)
        .attr("height", cellSize)
        .style("fill", d => colorScale(d.value))
        .attr("class", "cell")
        .on("mouseover", function (event, d) {
            d3.select("#tooltip1")
                .style("opacity", 1)
                .html(`${xAxisLabels[selectedX]}: ${d.x}<br>Arrests: ${d.y}<br>Avg Depression: ${d.value !== undefined ? d.value.toFixed(2) : "N/A"}`);
        })
        .on("mousemove", function (event) {
            d3.select("#tooltip1")
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", function () {
            d3.select("#tooltip1")
                .style("opacity", 0);
        });


    svg.selectAll(".label-x")
        .data(xAxisValues)
        .enter()
        .append("text")
        .attr("x", (d, i) => i * cellSize + cellSize / 2 - 40)
        .attr("y", yAxisValues.length * cellSize + margin.top - 5)
        .text(d => d)
        .attr("text-anchor", "start")
        .attr("transform", (d, i) => {
            const x = i * cellSize + cellSize / 2;
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
        .attr("x", 70)
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

    // X-axis Label
    svg.append("text")
        .attr("x", (xAxisValues.length * cellSize) / 2 + 100)
        .attr("y", yAxisValues.length * cellSize + margin.top + 120)
        .attr("text-anchor", "middle")
        .text(`Number of Days ${xAxisLabels[selectedX]} in Past 30 Days`)
        .style("font-size", "14px")
        .style("font-weight", "bold");

    // Y-axis Label
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", `translate(-70, ${(yAxisValues.length * cellSize) / 2 + margin.top}) rotate(-90)`)
        .text("Number of Times Arrested and Booked in Past 12 Months")
        .style("font-size", "14px")
        .style("font-weight", "bold");

    // Add a color legend
    const legendWidth = 200;
    const legendHeight = 20;

    // Append the gradient rectangle
    svg.append("rect")
        .attr("x", (width - legendWidth) / 2 + margin.left - 200)
        .attr("y", height + margin.top - 50)
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", `url(#legend-gradient-${label})`);

    // Add a scale for the legend
    const legendScale = d3.scaleLinear()
        .domain([minVal, maxVal])
        .range([(width - legendWidth) / 2 + margin.left, (width + legendWidth) / 2 + margin.left]);

    const legendAxis = d3.axisBottom(legendScale)
        .ticks(5)
        .tickFormat(d3.format(".2f")); // format numbers to 2 decimal places

    svg.append("g")
        .attr("transform", `translate(0, ${height + margin.top + 70})`)
        .call(legendAxis);

    // Add a label for the color legend
    svg.append("text")
        .attr("x", width / 2 + margin.left - 200)
        .attr("y", height + margin.top - 80)
        .attr("text-anchor", "middle")
        .text("Increasing Average Depression Frequency ➔")
        .style("font-size", "14px")
        .style("font-weight", "bold");


}

function group(day) {
    if (day === 0) return "0";
    if (day >= 1 && day <= 5) return "1-5";
    if (day >= 6 && day <= 10) return "6-10";
    if (day >= 11 && day <= 15) return "11-15";
    if (day >= 16 && day <= 20) return "16-20";
    if (day >= 21 && day <= 25) return "21-25";
    if (day >= 26 && day <= 30) return "26-30";
    return null;  // should not happen if filtered correctly
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

// function drawScatterPlot(data) {
//     const scatterMargin = { top: 20, right: 30, bottom: 30, left: 40 };
//     const scatterWidth = 800 - scatterMargin.left - scatterMargin.right;
//     const scatterHeight = 400 - scatterMargin.top - scatterMargin.bottom;

//     const svgScatter = d3.select("#scatter-plot")
//         .append("svg")
//         .attr("width", scatterWidth + scatterMargin.left + scatterMargin.right)
//         .attr("height", scatterHeight + scatterMargin.top + scatterMargin.bottom)
//         .append("g")
//         .attr("transform", `translate(${scatterMargin.left},${scatterMargin.top})`);

//     const xScale = d3.scaleLinear()
//         .domain([0, d3.max(data, d => d.NOBOOKY2)])
//         .range([0, scatterWidth]);

//     const yScale = d3.scaleLinear()
//         .domain([0, d3.max(data, d => d.ASDSOVRL)])
//         .range([scatterHeight, 0]);

//     svgScatter.append("g")
//         .attr("transform", `translate(0,${scatterHeight})`)
//         .call(d3.axisBottom(xScale).ticks(10));

//     svgScatter.append("g")
//         .call(d3.axisLeft(yScale).ticks(10));

//     svgScatter.selectAll("circle")
//         .data(data)
//         .enter()
//         .append("circle")
//         .attr("cx", d => xScale(d.NOBOOKY2))
//         .attr("cy", d => yScale(d.ASDSOVRL))
//         .attr("r", 5)
//         .attr("fill", d => d.HLTINMNT === "1" ? "steelblue" : "orange")
//         .attr("opacity", 0.7)
//         .on("mouseover", function (event, d) {
//             d3.select("#tooltip")
//                 .style("display", "block")
//                 .style("left", (event.pageX + 10) + "px")
//                 .style("top", (event.pageY - 20) + "px")
//                 .html(`Times Arrested: ${d.NOBOOKY2}<br>Depression Intensity: ${d.ASDSOVRL}<br>Treatment Status: ${d.HLTINMNT === "1" ? "Received Treatment" : "No Treatment"}`);
//         })
//         .on("mousemove", function (event) {
//             d3.select("#tooltip")
//                 .style("left", (event.pageX + 10) + "px")
//                 .style("top", (event.pageY - 20) + "px");
//         })
//         .on("mouseout", function () {
//             d3.select("#tooltip").style("display", "none");
//         });

//     // Title
//     svgScatter.append("text")
//         .attr("x", scatterWidth / 2)
//         .attr("y", -10)
//         .attr("text-anchor", "middle")
//         .text("Depression Intensity vs. Times Arrested")
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



function drawHistogram(data) {
    const margin = { top: 40, right: 30, bottom: 50, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#box-plot") // Same container, reuse ID
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Prepare score and group combinations
    const scoreRange = [1, 2, 3, 4, 5];
    const groupLabels = ["1", "2"];

    // Count how many responses per score per group
    const counts = [];
    scoreRange.forEach(score => {
        groupLabels.forEach(group => {
            const groupData = data.filter(d => String(d.HLTINMNT) === group);
            const count = groupData.filter(d => +d.DSTDEPRS === score).length;
            counts.push({ score, group, count });
        });
    });

    // Scales
    const x0 = d3.scaleBand()
        .domain(scoreRange)
        .range([0, width])
        .padding(0.2);

    const x1 = d3.scaleBand()
        .domain(groupLabels)
        .range([0, x0.bandwidth()])
        .padding(0.05);

    const y = d3.scaleLinear()
        .domain([0, d3.max(counts, d => d.count)]).nice()
        .range([height, 0]);

    const color = d3.scaleOrdinal()
        .domain(groupLabels)
        .range(["steelblue", "orange"]);

    // Axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x0).tickFormat(d => `Score ${d}`));

    svg.append("g")
        .call(d3.axisLeft(y));

    // Bars
    svg.selectAll("g.bar-group")
        .data(scoreRange)
        .enter()
        .append("g")
        .attr("class", "bar-group")
        .attr("transform", d => `translate(${x0(d)},0)`)
        .selectAll("rect")
        .data(d => counts.filter(c => c.score === d))
        .enter()
        .append("rect")
        .attr("x", d => x1(d.group))
        .attr("y", d => y(d.count))
        .attr("width", x1.bandwidth())
        .attr("height", d => height - y(d.count))
        .attr("fill", d => color(d.group));

    // Legend
    const legend = svg.append("g")
        .attr("transform", `translate(${width - 450}, 0)`);

    legend.selectAll("rect")
        .data(groupLabels)
        .enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", (d, i) => i * 20)
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", d => color(d));

    legend.selectAll("text")
        .data(groupLabels)
        .enter()
        .append("text")
        .attr("x", 20)
        .attr("y", (d, i) => i * 20 + 10)
        .text(d => d === "1" ? "difficulties" : "NO difficulties");



    // X Axis Label
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .text("Depression Frequency");

    // Y Axis Label
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -50)
        .text("Number of Responses");


    // Title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -15)
        .attr("text-anchor", "middle")
        .text("Depression Score Distribution by Treatment Status")
        .style("font-size", "22px");
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


// Function to create the scatter plot
// Function to create the scatterplot
// function createScatterPlot(data) {

//     // Convert the relevant columns to numbers
//     data.forEach(function(d) {
//         d.x = +d.ASDSOVRL;  // ASDSOVRL for the x-axis (converted to number)
//         d.y = +d.NOBOOKY2;  // NOBOOKY2 for the y-axis (converted to number)
//     });

//     // Set up dimensions and margins for the scatter plot
//     const margin = { top: 20, right: 20, bottom: 60, left: 80 };
//     const width = 600 - margin.left - margin.right;
//     const height = 400 - margin.top - margin.bottom;

//     // Create SVG container for the scatter plot
//     const svg = d3.select("#scatter-plot").append("svg")
//         .attr("width", width + margin.left + margin.right)
//         .attr("height", height + margin.top + margin.bottom)
//       .append("g")
//         .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//     // Set up the x-axis scale
//     const xScale = d3.scaleLinear()
//         .domain([0, d3.max(data, d => d.x)]) // Set domain based on the max value of ASDSOVRL
//         .range([0, width]); // Map to the width of the SVG container

//     // Set up the y-axis scale
//     const yScale = d3.scaleLinear()
//         .domain([0, d3.max(data, d => d.y)]) // Set domain based on the max value of NOBOOKY2
//         .range([height, 0]); // Map to the height of the SVG container (inverted Y axis)

//     // Add circles (data points) to the scatter plot
//     svg.selectAll("circle")
//         .data(data)
//         .enter().append("circle")
//         .attr("cx", d => xScale(d.x)) // X position based on ASDSOVRL
//         .attr("cy", d => yScale(d.y)) // Y position based on NOBOOKY2
//         .attr("r", 5) // Radius of the circles
//         .attr("fill", "blue"); // Circle color

//     // Calculate linear regression (slope m and intercept b)
//     const n = data.length;
//     const sumX = d3.sum(data, d => d.x);
//     const sumY = d3.sum(data, d => d.y);
//     const sumXY = d3.sum(data, d => d.x * d.y);
//     const sumX2 = d3.sum(data, d => d.x * d.x);

//     const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);  // Slope
//     const b = (sumY - m * sumX) / n;  // Intercept

//     // Define the trend line (y = mx + b)
//     const trendLine = [
//         { x: 0, y: m * 0 + b },  // Start of the line
//         { x: d3.max(data, d => d.x), y: m * d3.max(data, d => d.x) + b }  // End of the line
//     ];

//     // Add the trend line to the plot
//     svg.append("path")
//         .data([trendLine])
//         .attr("class", "trend-line")
//         .attr("d", d3.line()
//             .x(d => xScale(d.x))
//             .y(d => yScale(d.y))
//         )
//         .attr("fill", "none")
//         .attr("stroke", "red")
//         .attr("stroke-width", 2);

//     // Add X-axis to the plot
//     const xAxis = svg.append("g")
//         .attr("transform", "translate(0," + height + ")")
//         .call(d3.axisBottom(xScale));

//     // Add Y-axis to the plot
//     const yAxis = svg.append("g")
//         .call(d3.axisLeft(yScale));

//     // Add x-axis label
//     svg.append("text")
//         .attr("class", "x-axis-label")
//         .attr("x", width / 2)  // Position the label in the center of the x-axis
//         .attr("y", height + 50)  // Position the label below the x-axis
//         .style("text-anchor", "middle")  // Center align the label
//         .text("Adult: Overall Severity Level of MDE Interference");  // Label for the x-axis

//     // Add y-axis label
//     svg.append("text")
//         .attr("class", "y-axis-label")
//         .attr("transform", "rotate(-90)")  // Rotate the label to be vertical
//         .attr("x", -height / 2)  // Position the label in the center of the y-axis
//         .attr("y", -60)  // Position the label to the left of the y-axis
//         .style("text-anchor", "middle")  // Center align the label
//         .text("NOBOOKY2: Arrests/Drug Use");  // Label for the y-axis (if relevant)

//     // Tooltip behavior on mouseover for each data point
//     const tooltip = d3.select("#tooltip1");
//     svg.selectAll("circle")
//         .on("mouseover", function(event, d) {
//             tooltip.transition()
//                 .duration(200)
//                 .style("opacity", .9);
//             tooltip.html(`ASDSOVRL: ${d.x}<br>NOBOOKY2: ${d.y}`)
//                 .style("left", (event.pageX + 5) + "px")
//                 .style("top", (event.pageY - 28) + "px");
//         })
//         .on("mouseout", function() {
//             tooltip.transition()
//                 .duration(500)
//                 .style("opacity", 0);
//         });
// }

function createBarChart(data) {
    // Convert the relevant columns to numbers
    data.forEach(function (d) {
        d.x = +d.ASDSOVRL;  // Adult MDE interference level
        d.y = +d.NOBOOKY2;  // Times arrested (NOBOOKY2)
    });

    // Set up dimensions and margins
    const margin = { top: 40, right: 20, bottom: 60, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create SVG container
    const svg = d3.select("#scatter-plot").html("")  // clear the old scatter plot
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // X scale: just based on your two x values (0 and 99)
    const xScale = d3.scaleBand()
        .domain(data.map(d => d.x))
        .range([0, width])
        .padding(0.4);

    // Y scale
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.y)])  // up to the max of NOBOOKY2
        .nice()
        .range([height, 0]);

    // Create bars
    svg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.x))
        .attr("y", d => yScale(d.y))
        .attr("width", xScale.bandwidth())
        .attr("height", d => height - yScale(d.y))
        .attr("fill", "steelblue");

    // X Axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale));

    // Y Axis
    svg.append("g")
        .call(d3.axisLeft(yScale));

    // X Axis Label
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .text("Depression Intensity");

    // Y Axis Label
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 20)
        .text("Average arrest frequency");

    // Title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .style("font-size", "22px")
        .text("Relationship between Depression Intensity and Average Arrest frequency");

}

// function init() {

//     d3.tsv("data/spiral_clean.tsv", d => ({
//         day: +d.day,
//         gender: +d.GENDER_R,
//         alcoholUse: +d.ALCDAYS,
//         marijuanaUse: +d.MJDAY30A
//     })).then(data => {
//         const maleAlcohol = Array(31).fill(0);
//         const femaleAlcohol = Array(31).fill(0);
//         const maleMJ = Array(31).fill(0);
//         const femaleMJ = Array(31).fill(0);

//         const totalMales = data.filter(d => d.gender === 1).length;
//         const totalFemales = data.filter(d => d.gender === 0).length;

//         console.log("Total Males:", totalMales);
//         console.log("Total Females:", totalFemales);

//         d3.select("#spiral-alcohol")
//             .append("div")
//             .html(`Total Male Respondents: ${totalMales}`)
//             .style("text-align", "center")
//             .style("margin-top", "10px")
//             .style("font-size", "14px");

//         d3.select("#spiral-mj")
//             .append("div")
//             .html(`Total Female Respondents: ${totalFemales}`)
//             .style("text-align", "center")
//             .style("margin-top", "10px")
//             .style("font-size", "14px");

//         let totalAlcoholMale = 0, countAlcoholMale = 0;
//         let totalAlcoholFemale = 0, countAlcoholFemale = 0;
//         let totalMJMale = 0, countMJMale = 0;
//         let totalMJFemale = 0, countMJFemale = 0;

//         data.forEach(d => {
//             if (d.alcoholUse >= 1 && d.alcoholUse <= 30) {
//                 if (d.gender === 1) {
//                     maleAlcohol[d.alcoholUse]++;
//                     totalAlcoholMale += d.alcoholUse;
//                     countAlcoholMale++;
//                 } else {
//                     femaleAlcohol[d.alcoholUse]++;
//                     totalAlcoholFemale += d.alcoholUse;
//                     countAlcoholFemale++;
//                 }
//             }
//             if (d.marijuanaUse >= 1 && d.marijuanaUse <= 30) {
//                 if (d.gender === 1) {
//                     maleMJ[d.marijuanaUse]++;
//                     totalMJMale += d.marijuanaUse;
//                     countMJMale++;
//                 } else {
//                     femaleMJ[d.marijuanaUse]++;
//                     totalMJFemale += d.marijuanaUse;
//                     countMJFemale++;
//                 }
//             }
//         });

//         const avgAlcoholMale = (totalAlcoholMale / countAlcoholMale).toFixed(1);
//         const avgAlcoholFemale = (totalAlcoholFemale / countAlcoholFemale).toFixed(1);
//         const avgMJMale = (totalMJMale / countMJMale).toFixed(1);
//         const avgMJFemale = (totalMJFemale / countMJFemale).toFixed(1);

//         d3.select('#spiral-alcohol')
//             .append('div')
//             .html(`<strong>Average Alcohol Use:</strong><br>Male: ${avgAlcoholMale} days<br>Female: ${avgAlcoholFemale} days 
//             <br> Total Men Who Drank in the last 30 days: ${totalAlcoholMale} <br> Total Women Who Drank in the last 30 days: ${totalAlcoholFemale}`)
//             .style("text-align", "center")
//             .style("margin-top", "10px")
//             .style("font-size", "14px");

//         d3.select('#spiral-mj')
//             .append('div')
//             .html(`<strong>Average Marijuana Use:</strong><br>Male: ${avgMJMale} days<br>Female: ${avgMJFemale} days
//             <br> Total Men Who Drank in the last 30 days: ${totalMJMale} <br> Total Women Who Drank in the last 30 days: ${totalMJFemale}`)
//             .style("text-align", "center")
//             .style("margin-top", "10px")
//             .style("font-size", "14px");

//         const sharedMax = d3.max([
//             d3.max(maleAlcohol.slice(1)),
//             d3.max(femaleAlcohol.slice(1)),
//             d3.max(maleMJ.slice(1)),
//             d3.max(femaleMJ.slice(1))
//         ]);

//         const caseScale = d3.scaleLinear()
//             .domain([0, sharedMax])
//             .range([0, 80]);

//         createVis(svgAlcohol, maleAlcohol, femaleAlcohol, caseScale, "Alcohol");
//         createVis(svgMarijuana, maleMJ, femaleMJ, caseScale, "Marijuana");
//     });

//     d3.tsv("data/depression_vs_arrested.tsv").then(data => {
//         console.log("Depression data loaded:", data);
//         createBarChart(data);
//     });

//     d3.tsv("data/arrest_drug_clean.tsv").then(drawMovingBarGraph);
//     d3.tsv("data/merged_clean.tsv").then(data => {
//         const renamedData = data.map(d => ({
//             gender: +d.GENDER_R,
//             timesArrested: +d.NOBOOKY2,
//             alcoholDays: +d.ALCDAYS,
//             depressionFrequency: +d.DSTDEPRS,
//             ASDSOVRL: +d.ASDSOVRL,
//             HLTINMNT: d.HLTINMNT
//         }));

//         d3.tsv("data/depressionFrequency_treatmentStatus.tsv").then(drawHistogram);
//     });
// }

// window.addEventListener('load', init);

function toggleStats(substance) {
    const statsDiv = document.getElementById(`${substance}-stats`);
    const button = document.querySelector(`#spiral-${substance}-controls button`);
    
    if (statsDiv.style.display === "none") {
        statsDiv.style.display = "block";
        button.textContent = "Hide Stats";
    } else {
        statsDiv.style.display = "none";
        button.textContent = "Show Stats";
    }
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

        const totalMales = data.filter(d => d.gender === 1).length;
        const totalFemales = data.filter(d => d.gender === 0).length;

        let totalAlcoholMale = 0, countAlcoholMale = 0, numAlcoholMale = 0;
        let totalAlcoholFemale = 0, countAlcoholFemale = 0, numAlcoholFemale = 0;
        let totalMJMale = 0, countMJMale = 0, numMJMale = 0;
        let totalMJFemale = 0, countMJFemale = 0, numMJFemale = 0;

        data.forEach(d => {
            if (d.alcoholUse >= 1 && d.alcoholUse <= 30) {
                if (d.gender === 1) {
                    maleAlcohol[d.alcoholUse]++;
                    totalAlcoholMale += d.alcoholUse;
                    countAlcoholMale++;
                    numAlcoholMale++;
                } else {
                    femaleAlcohol[d.alcoholUse]++;
                    totalAlcoholFemale += d.alcoholUse;
                    countAlcoholFemale++;
                    numAlcoholFemale++;
                }
            }
            if (d.marijuanaUse >= 1 && d.marijuanaUse <= 30) {
                if (d.gender === 1) {
                    maleMJ[d.marijuanaUse]++;
                    totalMJMale += d.marijuanaUse;
                    countMJMale++;
                    numMJMale++;
                } else {
                    femaleMJ[d.marijuanaUse]++;
                    totalMJFemale += d.marijuanaUse;
                    countMJFemale++;
                    numMJFemale++;
                }
            }
        });

        const avgAlcoholMale = (totalAlcoholMale / countAlcoholMale).toFixed(1);
        const avgAlcoholFemale = (totalAlcoholFemale / countAlcoholFemale).toFixed(1);
        const avgMJMale = (totalMJMale / countMJMale).toFixed(1);
        const avgMJFemale = (totalMJFemale / countMJFemale).toFixed(1);

        const alcoholStats = `
            <strong>Average Alcohol Use:</strong><br>
            Male: ${avgAlcoholMale} days<br>
            Female: ${avgAlcoholFemale} days<br><br>
            <strong>Men Who Drank:</strong> ${countAlcoholMale} of ${totalMales}<br>
            <strong>Women Who Drank:</strong> ${countAlcoholFemale} of ${totalFemales}
        `;

        const mjStats = `
            <strong>Average Marijuana Use:</strong><br>
            Male: ${avgMJMale} days<br>
            Female: ${avgMJFemale} days<br><br>
            <strong>Men Who Used:</strong> ${countMJMale} of ${totalMales}<br>
            <strong>Women Who Used:</strong> ${countMJFemale} of ${totalFemales}
        `;

        d3.select('#alcohol-stats').html(alcoholStats);
        d3.select('#mj-stats').html(mjStats);

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

    d3.tsv("data/depression_vs_arrested.tsv").then(data => {
        console.log("Depression data loaded:", data);
        createBarChart(data);
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

        d3.tsv("data/depressionFrequency_treatmentStatus.tsv").then(drawHistogram);
    });
}

window.addEventListener('load', init);

