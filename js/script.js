let globalData = null;
let selectedDrugsForDepression = [];

function getGenderIconHTML(gender) {
  return gender === "female"
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="4rem" height="4rem" fill="hotpink" class="bi bi-person-standing-dress" viewBox="0 0 16 16">
        <path d="M8 3a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3m-.5 12.25V12h1v3.25a.75.75 
          0 0 0 1.5 0V12h1l-1-5v-.215a.285.285 0 0 1 
          .56-.078l.793 2.777a.711.711 0 1 0 1.364-.405l-1.065-3.461A3 3 0 
          0 0 8.784 3.5H7.216a3 3 0 0 0-2.868 2.118L3.283 
          9.079a.711.711 0 1 0 1.365.405l.793-2.777a.285.285 
          0 0 1 .56.078V7l-1 5h1v3.25a.75.75 0 0 0 1.5 0Z"/>
      </svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="4rem" height="4rem" fill="steelblue" class="bi bi-person-standing" viewBox="0 0 16 16">
        <path d="M8 3a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3M6 
          6.75v8.5a.75.75 0 0 0 1.5 0V10.5a.5.5 
          0 0 1 1 0v4.75a.75.75 0 0 0 1.5 0v-8.5a.25.25 
          0 1 1 .5 0v2.5a.75.75 0 0 0 1.5 0V6.5a3 3 
          0 0 0-3-3H7a3 3 0 0 0-3 3v2.75a.75.75 
          0 0 0 1.5 0v-2.5a.25.25 0 0 1 .5 0"/>
      </svg>`;
}

function calculateArrestRisk(data) {
  const clean = data.filter(d =>
    d.CIGEVER === "2" &&
    d.ALCEVER === "2" &&
    d.MJEVER === "2" &&
    d.IEMFLAG === "0" &&
    d.DEPRESSIONINDEX === "0"
  );

  const femaleClean = clean.filter(d => d.FEMALE === "1");
  const maleClean = clean.filter(d => d.FEMALE === "0");

  const femaleArrestRate = femaleClean.filter(d => d.CRIMEHIST === "1").length / femaleClean.length * 100;
  const maleArrestRate = maleClean.filter(d => d.CRIMEHIST === "1").length / maleClean.length * 100;

  return {
    male: Math.round(maleArrestRate),
    female: Math.round(femaleArrestRate)
  };
}
let jarElements = {};

function setupJars() {
  const container = document.getElementById("risk-bars");
  container.innerHTML = "";

  ["female", "male"].forEach(gender => {
    const color = gender === "female" ? "hotpink" : "steelblue";

    const jarDiv = document.createElement("div");
    jarDiv.classList.add("jar-wrapper");
    jarDiv.style.display = "flex";
    jarDiv.style.flexDirection = "column";
    jarDiv.style.alignItems = "center";
    jarDiv.style.margin = "0 2rem";

    const svg = d3.select(jarDiv)
      .append("svg")
      .attr("width", 100)
      .attr("height", 300);

    const scale = d3.scaleLinear().domain([0, 100]).range([0, 200]);
    const jarWidth = 60;
    const jarHeight = 200;
    const x = 20;

    const clipId = `clip-${gender}`;

    svg.append("clipPath")
      .attr("id", clipId)
      .append("rect")
      .attr("x", x)
      .attr("y", 50)
      .attr("width", jarWidth)
      .attr("height", jarHeight)
      .attr("rx", 10);

    svg.append("rect")
      .attr("x", x)
      .attr("y", 50)
      .attr("width", jarWidth)
      .attr("height", jarHeight)
      .attr("rx", 10)
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 2);

    const bar = svg.append("rect")
      .attr("x", x)
      .attr("y", 250)
      .attr("width", jarWidth)
      .attr("height", 0)
      .attr("fill", color)
      .attr("clip-path", `url(#${clipId})`);

    const label = svg.append("text")
      .attr("x", x + jarWidth / 2)
      .attr("y", 40)
      .attr("text-anchor", "middle")
      .text("0%")
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .style("fill", color);

    const icon = document.createElement("div");

    icon.innerHTML = getGenderIconHTML(gender);

    jarDiv.appendChild(icon);

    container.appendChild(jarDiv);

    jarElements[gender] = { bar, label, scale };
  });
}

function setupTobaccoJars() {
  const container = document.getElementById("tobacco-risk-bars");
  container.innerHTML = "";

  ["female", "male"].forEach(gender => {
    const color = gender === "female" ? "hotpink" : "steelblue";

    const jarDiv = document.createElement("div");
    jarDiv.classList.add("jar-wrapper");
    jarDiv.style.display = "flex";
    jarDiv.style.flexDirection = "column";
    jarDiv.style.alignItems = "center";
    jarDiv.style.margin = "0 2rem";

    const svg = d3.select(jarDiv)
      .append("svg")
      .attr("width", 100)
      .attr("height", 300);

    const scale = d3.scaleLinear().domain([0, 100]).range([0, 200]);
    const jarWidth = 60;
    const jarHeight = 200;
    const x = 20;

    const clipId = `clip-${gender}-tobacco`;

    svg.append("clipPath")
      .attr("id", clipId)
      .append("rect")
      .attr("x", x)
      .attr("y", 50)
      .attr("width", jarWidth)
      .attr("height", jarHeight)
      .attr("rx", 10);

    svg.append("rect")
      .attr("x", x)
      .attr("y", 50)
      .attr("width", jarWidth)
      .attr("height", jarHeight)
      .attr("rx", 10)
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 2);

    const bar = svg.append("rect")
      .attr("x", x)
      .attr("y", 250)
      .attr("width", jarWidth)
      .attr("height", 0)
      .attr("fill", color)
      .attr("clip-path", `url(#${clipId})`);

    const label = svg.append("text")
      .attr("x", x + jarWidth / 2)
      .attr("y", 40)
      .attr("text-anchor", "middle")
      .text("0%")
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .style("fill", color);

    const icon = document.createElement("div");

    icon.innerHTML = getGenderIconHTML(gender);

    jarDiv.appendChild(icon);


    container.appendChild(jarDiv);

    jarElements[`${gender}-tobacco`] = { bar, label, scale };
  });
}

function animateJars(risks) {
  ["female", "male"].forEach(gender => {
    const { bar, label, scale } = jarElements[gender];

    bar.transition()
      .duration(1500)
      .attr("y", 250 - scale(risks[gender]))
      .attr("height", scale(risks[gender]));

    let percent = 0;
    const interval = setInterval(() => {
      if (percent >= risks[gender]) {
        clearInterval(interval);
      } else {
        percent++;
        label.text(`${percent}%`);
      }
    }, 1500 / risks[gender]);
  });
}

function loadAndRender() {
  d3.tsv("data/choose_life_raw.tsv").then(data => {
    globalData = data;

    const risk = calculateArrestRisk(data);
    document.getElementById("clean-slate").style.display = "block";

    setupJars();

    setTimeout(() => {
      document.getElementById("clean-slate").scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }, 100);

    setTimeout(() => {
      animateJars(risk);
    }, 800);

    setTimeout(() => {
      const followUp = document.getElementById("follow-up");
      const nextBtn = document.getElementById("next-button-wrapper");
      followUp.style.display = "block";
      nextBtn.style.display = "block";
      setTimeout(() => {
        followUp.style.transition = "opacity 2s ease-in-out";
        nextBtn.style.transition = "opacity 2s ease-in-out";
        followUp.style.opacity = 1;
        nextBtn.style.opacity = 1;
      }, 100);
    }, 300);
  });
}

function calculateTobaccoRisk(data) {
  const tobaccoUsers = data.filter(d =>
    d.TOBFLAG === "1" &&
    d.CIGEVER === "2" &&
    d.ALCEVER === "2" &&
    d.MJEVER === "2" &&
    d.IEMFLAG === "0" &&
    d.DEPRESSIONINDEX === "0"
  );

  const female = tobaccoUsers.filter(d => d.FEMALE === "1");
  const male = tobaccoUsers.filter(d => d.FEMALE === "0");

  const femaleRisk = female.filter(d => d.CRIMEHIST === "1").length / female.length * 100;
  const maleRisk = male.filter(d => d.CRIMEHIST === "1").length / male.length * 100;

  return {
    female: Math.round(femaleRisk),
    male: Math.round(maleRisk)
  };
}
function showTobaccoResult(risks, message) {
  const container = document.getElementById("tobacco-result");
  container.innerHTML = "";

  const svg = d3.select(container)
    .append("svg")
    .attr("width", 1000)
    .attr("height", 300);

  const scale = d3.scaleLinear().domain([0, 100]).range([0, 200]);
  const jarWidth = 60;
  const jarHeight = 200;

  ["female", "male"].forEach((gender, i) => {
    const color = gender === "female" ? "hotpink" : "steelblue";
    const x = 80 * i + 685;
    const clipId = `clip-${gender}-tobacco`;

    svg.append("clipPath")
      .attr("id", clipId)
      .append("rect")
      .attr("x", x)
      .attr("y", 50)
      .attr("width", jarWidth)
      .attr("height", jarHeight)
      .attr("rx", 10);

    svg.append("rect")
      .attr("x", x)
      .attr("y", 50)
      .attr("width", jarWidth)
      .attr("height", jarHeight)
      .attr("rx", 10)
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 2);

    const bar = svg.append("rect")
      .attr("x", x)
      .attr("y", 250)
      .attr("width", jarWidth)
      .attr("height", 0)
      .attr("fill", color)
      .attr("clip-path", `url(#${clipId})`);

    const label = svg.append("text")
      .attr("x", x + jarWidth / 2)
      .attr("y", 40)
      .attr("text-anchor", "middle")
      .text("0%")
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .style("fill", color);

    let percent = 0;
    const target = risks[gender];
    bar.transition()
      .duration(1500)
      .attr("y", 250 - scale(target))
      .attr("height", scale(target));

    const interval = setInterval(() => {
      if (percent >= target) {
        clearInterval(interval);
        label.text(`${target}%`);
      } else {
        percent++;
        label.text(`${percent}%`);
      }
    }, 1500 / Math.max(target, 1));
  });

  d3.select(container)
    .append("p")
    .attr("id", "article-format")
    .html(message);
}

document.addEventListener("DOMContentLoaded", () => {
  d3.tsv("data/heatmap.tsv").then(data => {
        console.log("Heat map data loaded:", data);
        createHeatmap(data);
    });

  document.getElementById("calc-risk")?.addEventListener("click", loadAndRender);

  document.getElementById("start-life-btn")?.addEventListener("click", () => {
    document.getElementById("tobacco-image").style.display = "block";
    document.getElementById("tobacco-scene").style.display = "block";
    document.getElementById("tobacco-button-container").style.display = "block";

    document.getElementById("tobacco-scene").scrollIntoView({ behavior: "smooth", block: "center" });
  });

  document.getElementById("calc-tobacco-risk")?.addEventListener("click", () => {
    document.getElementById("calc-tobacco-risk").style.display = "none";
    document.getElementById("tobacco-risk-bars").style.display = "flex";
    setupTobaccoJars();


    const risks = calculateTobaccoRisk(globalData);

    ["female", "male"].forEach(gender => {
      const { bar, label, scale } = jarElements[`${gender}-tobacco`];
      const target = risks[gender];

      bar.transition()
        .duration(1500)
        .attr("y", 250 - scale(target))
        .attr("height", scale(target));

      let percent = 0;
      const interval = setInterval(() => {
        if (percent >= target) {
          clearInterval(interval);
          label.text(`${target}%`);
        } else {
          percent++;
          label.text(`${percent}%`);
        }
      }, 1500 / Math.max(target, 1));
    });

    setTimeout(() => {
      document.getElementById("tobacco-risk-bars").scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }, 100);
    setTimeout(() => {
      const wrapper = document.getElementById("tobacco-followup-wrapper");
      wrapper.style.display = "block";
      setTimeout(() => {
        wrapper.style.opacity = 1;
      }, 50);
    }, 1800);
  });
});

function calculateCigaretteRisk(data) {
  const cigUsers = data.filter(d =>
    d.CIGEVER === "1" &&
    d.TOBFLAG === "1" &&
    d.ALCEVER === "2" &&
    d.MJEVER === "2" &&
    d.IEMFLAG === "0" &&
    d.DEPRESSIONINDEX === "0"
  );

  const female = cigUsers.filter(d => d.FEMALE === "1");
  const male = cigUsers.filter(d => d.FEMALE === "0");

  const femaleRisk = female.filter(d => d.CRIMEHIST === "1").length / female.length * 100;
  const maleRisk = male.filter(d => d.CRIMEHIST === "1").length / male.length * 100;

  return {
    female: Math.round(femaleRisk),
    male: Math.round(maleRisk)
  };
}
function setupCigaretteJars() {
  const container = document.getElementById("cigarette-risk-bars");
  container.innerHTML = "";

  ["female", "male"].forEach(gender => {
    const color = gender === "female" ? "hotpink" : "steelblue";

    const jarDiv = document.createElement("div");
    jarDiv.classList.add("jar-wrapper");
    jarDiv.style.display = "flex";
    jarDiv.style.flexDirection = "column";
    jarDiv.style.alignItems = "center";
    jarDiv.style.margin = "0 2rem";

    const svg = d3.select(jarDiv)
      .append("svg")
      .attr("width", 100)
      .attr("height", 300);

    const scale = d3.scaleLinear().domain([0, 100]).range([0, 200]);
    const jarWidth = 60;
    const jarHeight = 200;
    const x = 20;

    const clipId = `clip-${gender}-cigarette`;

    svg.append("clipPath")
      .attr("id", clipId)
      .append("rect")
      .attr("x", x)
      .attr("y", 50)
      .attr("width", jarWidth)
      .attr("height", jarHeight)
      .attr("rx", 10);

    svg.append("rect")
      .attr("x", x)
      .attr("y", 50)
      .attr("width", jarWidth)
      .attr("height", jarHeight)
      .attr("rx", 10)
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 2);

    const bar = svg.append("rect")
      .attr("x", x)
      .attr("y", 250)
      .attr("width", jarWidth)
      .attr("height", 0)
      .attr("fill", color)
      .attr("clip-path", `url(#${clipId})`);

    const label = svg.append("text")
      .attr("x", x + jarWidth / 2)
      .attr("y", 40)
      .attr("text-anchor", "middle")
      .text("0%")
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .style("fill", color);

    const icon = document.createElement("div");

    icon.innerHTML = getGenderIconHTML(gender);

    jarDiv.appendChild(icon);
    container.appendChild(jarDiv);

    jarElements[`${gender}-cigarette`] = { bar, label, scale };
  });
}

document.getElementById("calc-cigarette-risk").addEventListener("click", () => {
  document.getElementById("calc-cigarette-risk").style.display = "none";
  document.getElementById("cigarette-risk-bars").style.display = "flex";
  setupCigaretteJars();

  const risks = calculateCigaretteRisk(globalData);

  ["female", "male"].forEach(gender => {
    const { bar, label, scale } = jarElements[`${gender}-cigarette`];
    const target = risks[gender];

    bar.transition()
      .duration(1500)
      .attr("y", 250 - scale(target))
      .attr("height", scale(target));

    let percent = 0;
    const interval = setInterval(() => {
      if (percent >= target) {
        clearInterval(interval);
        label.text(`${target}%`);
      } else {
        percent++;
        label.text(`${percent}%`);
      }
    }, 1500 / Math.max(target, 1));
  });

  setTimeout(() => {
    document.getElementById("cigarette-risk-bars").scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }, 100);

  setTimeout(() => {
    const wrapper = document.getElementById("cigarette-followup-wrapper");
    wrapper.style.display = "block";
    setTimeout(() => {
      wrapper.style.opacity = 1;
    }, 50);
  }, 1800);

  document.getElementById("cigarette-button-container").style.display = "none";
});

document.getElementById("continue-to-cigarettes").addEventListener("click", () => {
  document.getElementById("cigarette-scene").style.display = "block";
  document.getElementById("cigarette-image").style.display = "block";
  document.getElementById("cigarette-button-container").style.display = "block";
  document.getElementById("cigarette-scene").scrollIntoView({ behavior: "smooth", block: "center" });
});

document.getElementById("continue-to-alcohol").addEventListener("click", () => {
  const alcoholScene = document.getElementById("alcohol-scene");
  alcoholScene.style.display = "block";

  document.getElementById("alcohol-image").style.display = "block";

  alcoholScene.scrollIntoView({ behavior: "smooth", block: "center" });
});

function setupAlcoholJars() {
  const container = document.getElementById("alcohol-risk-bars");
  container.innerHTML = "";

  ["female", "male"].forEach(gender => {
    const color = gender === "female" ? "hotpink" : "steelblue";

    const jarDiv = document.createElement("div");
    jarDiv.classList.add("jar-wrapper");
    jarDiv.style.display = "flex";
    jarDiv.style.flexDirection = "column";
    jarDiv.style.alignItems = "center";
    jarDiv.style.margin = "0 2rem";

    const svg = d3.select(jarDiv)
      .append("svg")
      .attr("width", 100)
      .attr("height", 300);

    const scale = d3.scaleLinear().domain([0, 100]).range([0, 200]);
    const jarWidth = 60;
    const jarHeight = 200;
    const x = 20;
    const clipId = `clip-${gender}-alcohol`;

    svg.append("clipPath")
      .attr("id", clipId)
      .append("rect")
      .attr("x", x)
      .attr("y", 50)
      .attr("width", jarWidth)
      .attr("height", jarHeight)
      .attr("rx", 10);

    svg.append("rect")
      .attr("x", x)
      .attr("y", 50)
      .attr("width", jarWidth)
      .attr("height", jarHeight)
      .attr("rx", 10)
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 2);

    const bar = svg.append("rect")
      .attr("x", x)
      .attr("y", 250)
      .attr("width", jarWidth)
      .attr("height", 0)
      .attr("fill", color)
      .attr("clip-path", `url(#${clipId})`);

    const label = svg.append("text")
      .attr("x", x + jarWidth / 2)
      .attr("y", 40)
      .attr("text-anchor", "middle")
      .text("0%")
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .style("fill", color);

    const icon = document.createElement("div");

    icon.innerHTML = getGenderIconHTML(gender);

    jarDiv.appendChild(icon);
    container.appendChild(jarDiv);

    jarElements[`${gender}-alcohol`] = { bar, label, scale };
  });
}

function calculateAlcoholRisk(data) {
  const alcoholUsers = data.filter(d =>
    d.TOBFLAG === "1" &&
    d.CIGEVER === "1" &&
    d.ALCEVER === "1" &&
    d.MJEVER === "2" &&
    d.IEMFLAG === "0" &&
    d.DEPRESSIONINDEX === "0"
  );

  const female = alcoholUsers.filter(d => d.FEMALE === "1");
  const male = alcoholUsers.filter(d => d.FEMALE === "0");

  const femaleRisk = female.filter(d => d.CRIMEHIST === "1").length / female.length * 100;
  const maleRisk = male.filter(d => d.CRIMEHIST === "1").length / male.length * 100;

  return {
    female: Math.round(femaleRisk),
    male: Math.round(maleRisk)
  };
}

//Kamyavalli
function createHeatmap(data) {
  const selectedColumn = d3.select("#dataSelect").property("value");
  const selectedGender = d3.select("#genderSelect").property("value");

  const cleaned = data.filter(d => {
    const use = +d[selectedColumn];
    const dep = +d.DSTDEPRS;
    const gender = d.GENDER_R;

    const validUse =
      ((use >= 0 && use <= 30) || use === 91 || use === 93);
    const validDep = dep >= 1 && dep <= 5;

    return validUse && validDep && gender===selectedGender;
  });

  function binUsage(days) {
    if (days === 91 || days === 93) return "0 days";
    if (days <= 5) return "1–5";
    if (days <= 10) return "6–10";
    if (days <= 15) return "11–15";
    if (days <= 20) return "16–20";
    if (days <= 25) return "21–25";
    return "26–30";
  }

  const depressionLevels = [1, 2, 3, 4, 5]; // 1 = most depressed

  const grouped = d3.rollups(
    cleaned,
    v => {
      const total = v.length;
      const levelCounts = d3.rollup(
        v,
        v2 => v2.length,
        d => +d.DSTDEPRS
      );
      const result = { bin: binUsage(+v[0][selectedColumn]) };
      depressionLevels.forEach(level => {
        result[level] = (levelCounts.get(level) || 0) / total;
      });
      return result;
    },
    d => binUsage(+d[selectedColumn])
  );

  const areaData = grouped.map(([bin, data]) => ({ ...data, bin }));

  const binOrder = ["0 days", "1–5", "6–10", "11–15", "16–20", "21–25", "26–30"];
  areaData.sort((a, b) => binOrder.indexOf(a.bin) - binOrder.indexOf(b.bin));

  const stack = d3.stack()
    .keys(depressionLevels.map(d => d.toString()).reverse());

  const stackedSeries = stack(areaData);

  const svg = d3.select("#stacked_area");
  svg.selectAll("*").remove(); // Clear old content

  const margin = { top: 50, right: 30, bottom: 50, left: 50 },
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom;

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scalePoint()
    .domain(binOrder)
    .range([0, width])
    .padding(0.5);

  const y = d3.scaleLinear()
    .domain([0, 1])
    .range([height, 0]);

  const color = d3.scaleOrdinal()
    .domain(depressionLevels.map(d => d.toString()))
    .range(["#d73027", "#fc8d59", "#fee090", "#e0f3f8", "#91bfdb"]); // Red to blue, consistent

  const area = d3.area()
    .x(d => x(d.data.bin))
    .y0(d => y(d[0]))
    .y1(d => y(d[1]));

  g.selectAll("path")
    .data(stackedSeries)
    .enter().append("path")
    .attr("fill", d => color(d.key))
    .attr("d", area)
    .attr("stroke", "white")
    .attr("stroke-width", 0.5);

  g.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));

  g.append("g")
  .call(d3.axisLeft(y).ticks(5, "%"))
  .selectAll("text")
  .attr("dx", "0.5 em");
  
  //
  g.append("text")
  .attr("text-anchor", "middle")
  .attr("x", width / 2)
  .attr("y", height + margin.bottom - 10)  // slightly below the axis
  .style("font-size", "14px")
  .text("Number of Days");  // Change text as needed
  
  g.append("text")
  .attr("text-anchor", "middle")
  .attr("transform", `rotate(-90)`)
  .attr("x", -height / 2)
  .attr("y", -margin.left + 15)  // slightly left of the axis
  .style("font-size", "14px")
  .text("Proportion of Depression Levels");  // Change text as needed

  const legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${width + margin.left - 73},${margin.top})`);

  const depressionDescriptions = {
    1: "All of the time",
    2: "Most of the time",
    3: "Some of the time",
    4: "A little of the time",
    5: "None of the time"
  };

  depressionLevels.forEach((level, i) => {
    legend.append("rect")
      .attr("x", 0)
      .attr("y", i * 20)
      .attr("width", 12)
      .attr("height", 12)
      .attr("fill", color(level.toString()));

    legend.append("text")
      .attr("x", 18)
      .attr("y", i * 20 + 10)
      .text(depressionDescriptions[level])
      .attr("alignment-baseline", "middle")
      .style("font-size", "12px");
  });

  const titleMap = {
    ALCDAYS: "Depression Level Distribution by Alcohol Use (Stacked Area)",
    MJDAY30A: "Depression Level Distribution by Marijuana Use (Stacked Area)",
    CIG30USE: "Depression Level Distribution by Cigarette Use (Stacked Area)", 
    COCUS30A: "Depression Level Distribution by Coccaine Use (Stacked Area)",
    HER30USE: "Depression Level Distribution by Heroin Use (Stacked Area)"
  };

  svg.append("text")
    .attr("x", (width + margin.left + margin.right) / 2)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .style("font-size", "18px")
    .text(titleMap[selectedColumn]);
}

// Set up dropdown handler (one-time only)
d3.select("#dataSelect").on("change", () => {
  d3.tsv("data/heatmap.tsv").then(data => createHeatmap(data));
});

d3.select("#genderSelect").on("change", () => {
  d3.tsv("data/heatmap.tsv").then(data => createHeatmap(data));
});


// Initial load
d3.tsv( "data/heatmap.tsv"  ).then(data => createHeatmap(data));


document.getElementById("calc-alcohol-risk").addEventListener("click", () => {
  document.getElementById("calc-alcohol-risk").style.display = "none";
  document.getElementById("alcohol-risk-bars").style.display = "flex";
  setupAlcoholJars();

  const risks = calculateAlcoholRisk(globalData);

  ["female", "male"].forEach(gender => {
    const { bar, label, scale } = jarElements[`${gender}-alcohol`];
    const target = risks[gender];

    bar.transition()
      .duration(1500)
      .attr("y", 250 - scale(target))
      .attr("height", scale(target));

    let percent = 0;
    const interval = setInterval(() => {
      if (percent >= target) {
        clearInterval(interval);
        label.text(`${target}%`);
      } else {
        percent++;
        label.text(`${percent}%`);
      }
    }, 1500 / Math.max(target, 1));
  });

  setTimeout(() => {
    document.getElementById("alcohol-risk-bars").scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }, 100);
});


document.getElementById("calc-alcohol-risk").addEventListener("click", () => {
  document.getElementById("calc-alcohol-risk").style.display = "none";
  document.getElementById("alcohol-risk-bars").style.display = "flex";
  setupAlcoholJars();

  const risks = calculateAlcoholRisk(globalData);

  ["female", "male"].forEach(gender => {
    const { bar, label, scale } = jarElements[`${gender}-alcohol`];
    const target = risks[gender];

    bar.transition()
      .duration(1500)
      .attr("y", 250 - scale(target))
      .attr("height", scale(target));

    let percent = 0;
    const interval = setInterval(() => {
      if (percent >= target) {
        clearInterval(interval);
        label.text(`${target}%`);
      } else {
        percent++;
        label.text(`${percent}%`);
      }
    }, 1500 / Math.max(target, 1));
  });

  setTimeout(() => {
    document.getElementById("alcohol-risk-bars").scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }, 100);

  setTimeout(() => {
    const wrapper = document.getElementById("alcohol-followup-wrapper");
    wrapper.style.display = "block";
    setTimeout(() => {
      wrapper.style.opacity = 1;
    }, 50);
  }, 1800);
});

document.getElementById("continue-to-marijuana").addEventListener("click", () => {
  document.getElementById("marijuana-scene").style.display = "block";
  document.getElementById("marijuana-image").style.display = "block";
  document.getElementById("marijuana-button-container").style.display = "block";

  document.getElementById("marijuana-scene").scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
});

function calculateMarijuanaRisk(data) {
  const users = data.filter(d =>
    d.TOBFLAG === "1" &&
    d.CIGEVER === "1" &&
    d.ALCEVER === "1" &&
    d.MJEVER === "1" &&
    d.IEMFLAG === "0" &&
    d.DEPRESSIONINDEX === "0"
  );

  const female = users.filter(d => d.FEMALE === "1");
  const male = users.filter(d => d.FEMALE === "0");

  const femaleRisk = female.filter(d => d.CRIMEHIST === "1").length / female.length * 100;
  const maleRisk = male.filter(d => d.CRIMEHIST === "1").length / male.length * 100;

  return {
    female: Math.round(femaleRisk),
    male: Math.round(maleRisk)
  };
}

function setupMarijuanaJars() {
  const container = document.getElementById("marijuana-risk-bars");
  container.innerHTML = "";

  ["female", "male"].forEach(gender => {
    const color = gender === "female" ? "hotpink" : "steelblue";

    const jarDiv = document.createElement("div");
    jarDiv.classList.add("jar-wrapper");
    jarDiv.style.display = "flex";
    jarDiv.style.flexDirection = "column";
    jarDiv.style.alignItems = "center";
    jarDiv.style.margin = "0 2rem";

    const svg = d3.select(jarDiv)
      .append("svg")
      .attr("width", 100)
      .attr("height", 300);

    const scale = d3.scaleLinear().domain([0, 100]).range([0, 200]);
    const jarWidth = 60;
    const jarHeight = 200;
    const x = 20;

    const clipId = `clip-${gender}-marijuana`;

    svg.append("clipPath")
      .attr("id", clipId)
      .append("rect")
      .attr("x", x)
      .attr("y", 50)
      .attr("width", jarWidth)
      .attr("height", jarHeight)
      .attr("rx", 10);

    svg.append("rect")
      .attr("x", x)
      .attr("y", 50)
      .attr("width", jarWidth)
      .attr("height", jarHeight)
      .attr("rx", 10)
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 2);

    const bar = svg.append("rect")
      .attr("x", x)
      .attr("y", 250)
      .attr("width", jarWidth)
      .attr("height", 0)
      .attr("fill", color)
      .attr("clip-path", `url(#${clipId})`);

    const label = svg.append("text")
      .attr("x", x + jarWidth / 2)
      .attr("y", 40)
      .attr("text-anchor", "middle")
      .text("0%")
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .style("fill", color);

    const icon = document.createElement("div");

    icon.innerHTML = getGenderIconHTML(gender);

    jarDiv.appendChild(icon);
    container.appendChild(jarDiv);

    jarElements[`${gender}-marijuana`] = { bar, label, scale };
  });
}

document.getElementById("calc-marijuana-risk").addEventListener("click", () => {
  document.getElementById("calc-marijuana-risk").style.display = "none";
  document.getElementById("marijuana-risk-bars").style.display = "flex";
  setupMarijuanaJars();

  const risks = calculateMarijuanaRisk(globalData);

  ["female", "male"].forEach(gender => {
    const { bar, label, scale } = jarElements[`${gender}-marijuana`];
    const target = risks[gender];

    bar.transition()
      .duration(1500)
      .attr("y", 250 - scale(target))
      .attr("height", scale(target));

    let percent = 0;
    const interval = setInterval(() => {
      if (percent >= target) {
        clearInterval(interval);
        label.text(`${target}%`);
      } else {
        percent++;
        label.text(`${percent}%`);
      }
    }, 1500 / Math.max(target, 1));
  });

  setTimeout(() => {
    document.getElementById("marijuana-risk-bars").scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }, 100);
});

document.getElementById("calc-marijuana-risk").addEventListener("click", () => {
  document.getElementById("calc-marijuana-risk").style.display = "none";
  document.getElementById("marijuana-risk-bars").style.display = "flex";
  setupMarijuanaJars();

  const risks = calculateMarijuanaRisk(globalData);

  ["female", "male"].forEach(gender => {
    const { bar, label, scale } = jarElements[`${gender}-marijuana`];
    const target = risks[gender];

    bar.transition()
      .duration(1500)
      .attr("y", 250 - scale(target))
      .attr("height", scale(target));

    let percent = 0;
    const interval = setInterval(() => {
      if (percent >= target) {
        clearInterval(interval);
        label.text(`${target}%`);
      } else {
        percent++;
        label.text(`${percent}%`);
      }
    }, 1500 / Math.max(target, 1));
  });

  setTimeout(() => {
    document.getElementById("marijuana-risk-bars").scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }, 100);

  setTimeout(() => {
    const wrapper = document.getElementById("marijuana-followup-wrapper");
    wrapper.style.display = "block";
    setTimeout(() => {
      wrapper.style.opacity = 1;
    }, 50);
  }, 1800);
});

document.getElementById("continue-to-harddrugs").addEventListener("click", () => {
  document.getElementById("drug-scene").style.display = "block";
  document.getElementById("hard-drugs-img").style.display = "block";
  document.getElementById("drug-scene").scrollIntoView({ behavior: "smooth", block: "center" });
});

function calculateHardDrugRisk(data, selectedDrugs) {
  return {
    female: computeRisk(data, selectedDrugs, "1"),
    male: computeRisk(data, selectedDrugs, "0"),
  };
}

function computeRisk(data, selectedDrugs, genderVal) {
  const subset = data.filter(d =>
    d.FEMALE === genderVal &&
    d.CIGEVER === "1" &&
    d.ALCEVER === "1" &&
    d.MJEVER === "1" &&
    d.IEMFLAG === "1" &&
    d.DEPRESSIONINDEX === "0" &&
    d.TOBFLAG === "1" &&
    selectedDrugs.every(drug => d[drug] === "1")
  );

  const arrests = subset.filter(d => d.CRIMEHIST === "1").length;
  return Math.round((arrests / Math.max(subset.length, 1)) * 100);
}

document.getElementById("calc-drug-risk").addEventListener("click", () => {
  const checked = [...document.querySelectorAll("#drug-form input:checked")];
  const selectedDrugs = checked.map(input => input.value);

  if (selectedDrugs.length === 0) return alert("Select at least one drug.");

  selectedDrugsForDepression = selectedDrugs;

  const risks = calculateHardDrugRisk(globalData, selectedDrugs);

  setupDrugJars();

  const riskBars = document.getElementById("drug-risk-bars");
  riskBars.style.display = "flex";
  riskBars.scrollIntoView({ behavior: "smooth", block: "center" });

  setTimeout(() => {
    ["female", "male"].forEach(gender => {
      const { bar, label, scale } = jarElements[`${gender}-drug`];
      const target = risks[gender];

      bar.transition()
        .duration(1500)
        .attr("y", 250 - scale(target))
        .attr("height", scale(target));

      let percent = 0;
      const interval = setInterval(() => {
        if (percent >= target) {
          clearInterval(interval);
          label.text(`${target}%`);
        } else {
          percent++;
          label.text(`${percent}%`);
        }
      }, 1500 / Math.max(target, 1));
    });

    const followup = document.getElementById("drug-followup-wrapper");
    followup.style.display = "block";
    document.getElementById("drug-followup").innerText =
      `Their risk jumped again after trying ${selectedDrugs.length > 1 ? "multiple drugs" : "one drug"}.`;

    setTimeout(() => {
      followup.style.opacity = 1;
    }, 50);
  }, 1600);
});


function setupDrugJars() {
  const container = document.getElementById("drug-risk-bars");
  container.innerHTML = "";

  ["female", "male"].forEach(gender => {
    const color = gender === "female" ? "hotpink" : "steelblue";

    const jarDiv = document.createElement("div");
    jarDiv.classList.add("jar-wrapper");
    jarDiv.style.display = "flex";
    jarDiv.style.flexDirection = "column";
    jarDiv.style.alignItems = "center";
    jarDiv.style.margin = "0 2rem";

    const svg = d3.select(jarDiv)
      .append("svg")
      .attr("width", 100)
      .attr("height", 300);

    const scale = d3.scaleLinear().domain([0, 100]).range([0, 200]);
    const jarWidth = 60;
    const jarHeight = 200;
    const x = 20;
    const clipId = `clip-${gender}-drug`;

    svg.append("clipPath")
      .attr("id", clipId)
      .append("rect")
      .attr("x", x)
      .attr("y", 50)
      .attr("width", jarWidth)
      .attr("height", jarHeight)
      .attr("rx", 10);

    svg.append("rect")
      .attr("x", x)
      .attr("y", 50)
      .attr("width", jarWidth)
      .attr("height", jarHeight)
      .attr("rx", 10)
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 2);

    const bar = svg.append("rect")
      .attr("x", x)
      .attr("y", 250)
      .attr("width", jarWidth)
      .attr("height", 0)
      .attr("fill", color)
      .attr("clip-path", `url(#${clipId})`);

    const label = svg.append("text")
      .attr("x", x + jarWidth / 2)
      .attr("y", 40)
      .attr("text-anchor", "middle")
      .text("0%")
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .style("fill", color);

    const icon = document.createElement("div");

    icon.innerHTML = getGenderIconHTML(gender);

    jarDiv.appendChild(icon);
    container.appendChild(jarDiv);

    jarElements[`${gender}-drug`] = { bar, label, scale };
  });
}

setTimeout(() => {
  ["female", "male"].forEach(gender => {
    const { bar, label, scale } = jarElements[`${gender}-drug`];
    const target = risks[gender];

    bar.transition()
      .duration(1500)
      .attr("y", 250 - scale(target))
      .attr("height", scale(target));

    let percent = 0;
    const interval = setInterval(() => {
      if (percent >= target) {
        clearInterval(interval);
        label.text(`${target}%`);
      } else {
        percent++;
        label.text(`${percent}%`);
      }
    }, 1500 / Math.max(target, 1));
  });

  const followup = document.getElementById("drug-followup-wrapper");
  followup.style.display = "block";

  document.getElementById("drug-followup").innerText =
    `Their risk jumped again after trying ${selectedDrugs.length > 1 ? "multiple drugs" : "one drug"}.`;

  const severeDepressed = globalData.filter(d =>
    d.DEPRESSIONINDEX &&
    +d.DEPRESSIONINDEX >= 7
  );

  if (severeDepressed.length > 0) {
    setTimeout(() => {
      const wrapper = document.getElementById("depression-followup-wrapper");
      wrapper.style.display = "block";
      document.getElementById("depression-followup").innerText =
        "After everything they've been through, Karen and Bob have begun to spiral into severe depression.";

      setTimeout(() => {
        wrapper.style.opacity = 1;
      }, 50);
    }, 1800);
  }
}, 1000);

document.getElementById("continue-to-depression").addEventListener("click", () => {
  const scene = document.getElementById("depression-scene");
  scene.style.display = "block";

  scene.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
});

function calculateDepressionRisk(data, selectedDrugs = []) {
  const depressed = data.filter(d =>
    Number(d.DEPRESSIONINDEX) >= 7 &&
    d.CIGEVER === "1" &&
    d.ALCEVER === "1" &&
    d.MJEVER === "1" &&
    d.IEMFLAG === "1" &&
    d.TOBFLAG === "1" &&
    selectedDrugs.every(drug => d[drug] === "1")
  );

  const female = depressed.filter(d => d.FEMALE === "1");
  const male = depressed.filter(d => d.FEMALE === "0");

  const femaleRisk = female.filter(d => d.CRIMEHIST === "1").length / female.length * 100;
  const maleRisk = male.filter(d => d.CRIMEHIST === "1").length / male.length * 100;

  return {
    female: Math.round(femaleRisk),
    male: Math.round(maleRisk)
  };
}

document.getElementById("continue-to-harddrugs").addEventListener("click", () => {
  document.getElementById("drug-scene").style.display = "block";
  document.getElementById("drug-scene").scrollIntoView({ behavior: "smooth", block: "center" });
});
document.getElementById("continue-to-depression").addEventListener("click", () => {
  const scene = document.getElementById("depression-scene");
  scene.style.display = "block";
  scene.scrollIntoView({ behavior: "smooth", block: "center" });

  setupDepressionJars();
  const risks = calculateDepressionRisk(globalData, selectedDrugsForDepression);

  ["female", "male"].forEach(gender => {
    const { bar, label, scale } = jarElements[`${gender}-depression`];
    const target = risks[gender];

    bar.transition()
      .duration(1500)
      .attr("y", 250 - scale(target))
      .attr("height", scale(target));

    let percent = 0;
    const interval = setInterval(() => {
      if (percent >= target) {
        clearInterval(interval);
        label.text(`${target}%`);
      } else {
        percent++;
        label.text(`${percent}%`);
      }
    }, 1500 / Math.max(target, 1));
  });

});


function setupDepressionJars() {
  const container = document.getElementById("depression-risk-bars");
  container.innerHTML = "";

  ["female", "male"].forEach(gender => {
    const color = gender === "female" ? "hotpink" : "steelblue";

    const jarDiv = document.createElement("div");
    jarDiv.classList.add("jar-wrapper");
    jarDiv.style.display = "flex";
    jarDiv.style.flexDirection = "column";
    jarDiv.style.alignItems = "center";
    jarDiv.style.margin = "0 2rem";

    const svg = d3.select(jarDiv)
      .append("svg")
      .attr("width", 100)
      .attr("height", 300);

    const scale = d3.scaleLinear().domain([0, 100]).range([0, 200]);
    const jarWidth = 60;
    const jarHeight = 200;
    const x = 20;
    const clipId = `clip-${gender}-depression`;

    svg.append("clipPath")
      .attr("id", clipId)
      .append("rect")
      .attr("x", x)
      .attr("y", 50)
      .attr("width", jarWidth)
      .attr("height", jarHeight)
      .attr("rx", 10);

    svg.append("rect")
      .attr("x", x)
      .attr("y", 50)
      .attr("width", jarWidth)
      .attr("height", jarHeight)
      .attr("rx", 10)
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 2);

    const bar = svg.append("rect")
      .attr("x", x)
      .attr("y", 250)
      .attr("width", jarWidth)
      .attr("height", 0)
      .attr("fill", color)
      .attr("clip-path", `url(#${clipId})`);

    const label = svg.append("text")
      .attr("x", x + jarWidth / 2)
      .attr("y", 40)
      .attr("text-anchor", "middle")
      .text("0%")
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .style("fill", color);

    const icon = document.createElement("div");
    icon.innerHTML = getGenderIconHTML(gender);

    jarDiv.appendChild(icon);
    container.appendChild(jarDiv);

    jarElements[`${gender}-depression`] = { bar, label, scale };
  });
}


document.getElementById("continue-to-depression").addEventListener("click", () => {
  document.getElementById("depression-scene").style.display = "block";
  document.getElementById("depression-img").style.display = "block";
  document.getElementById("depression-button-container").style.display = "block";

  document.getElementById("depression-scene").scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
});



function setupDepressionJars() {
  const container = document.getElementById("depression-risk-bars");
  container.innerHTML = "";

  ["female", "male"].forEach(gender => {
    const color = gender === "female" ? "hotpink" : "steelblue";

    const jarDiv = document.createElement("div");
    jarDiv.classList.add("jar-wrapper");
    jarDiv.style.display = "flex";
    jarDiv.style.flexDirection = "column";
    jarDiv.style.alignItems = "center";
    jarDiv.style.margin = "0 2rem";

    const svg = d3.select(jarDiv)
      .append("svg")
      .attr("width", 100)
      .attr("height", 300);

    const scale = d3.scaleLinear().domain([0, 100]).range([0, 200]);
    const jarWidth = 60;
    const jarHeight = 200;
    const x = 20;
    const clipId = `clip-${gender}-depression`;

    svg.append("clipPath")
      .attr("id", clipId)
      .append("rect")
      .attr("x", x)
      .attr("y", 50)
      .attr("width", jarWidth)
      .attr("height", jarHeight)
      .attr("rx", 10);

    svg.append("rect")
      .attr("x", x)
      .attr("y", 50)
      .attr("width", jarWidth)
      .attr("height", jarHeight)
      .attr("rx", 10)
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 2);

    const bar = svg.append("rect")
      .attr("x", x)
      .attr("y", 250)
      .attr("width", jarWidth)
      .attr("height", 0)
      .attr("fill", color)
      .attr("clip-path", `url(#${clipId})`);

    const label = svg.append("text")
      .attr("x", x + jarWidth / 2)
      .attr("y", 40)
      .attr("text-anchor", "middle")
      .text("0%")
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .style("fill", color);

    const icon = document.createElement("div");
    icon.innerHTML = getGenderIconHTML(gender);

    jarDiv.appendChild(icon);
    container.appendChild(jarDiv);

    jarElements[`${gender}-depression`] = { bar, label, scale };
  });
}
document.getElementById("calc-depression-risk").addEventListener("click", () => {
  document.getElementById("depression-risk-bars").style.display = "flex";

  setTimeout(() => {
    document.getElementById("depression-risk-bars").scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }, 100);

  setupDepressionJars();
  const risks = calculateDepressionRisk(globalData, selectedDrugsForDepression);

  ["female", "male"].forEach(gender => {
    const { bar, label, scale } = jarElements[`${gender}-depression`];
    const target = risks[gender];

    bar.transition()
      .duration(1500)
      .attr("y", 250 - scale(target))
      .attr("height", scale(target));

    let percent = 0;
    const interval = setInterval(() => {
      if (percent >= target) {
        clearInterval(interval);
        label.text(`${target}%`);
      } else {
        percent++;
        label.text(`${percent}%`);
      }
    }, 1500 / Math.max(target, 1));
  });

  setTimeout(() => {
    const wrapper = document.getElementById("depression-followup-wrapper");
    wrapper.style.display = "block";
    setTimeout(() => {
      wrapper.style.opacity = 1;
    }, 50);
  }, 1600);
});

window.addEventListener('load', init);

