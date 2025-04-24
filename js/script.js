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
