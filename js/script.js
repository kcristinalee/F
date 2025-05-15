let globalData = null;

// arrest_risk.js
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
  let jarElements = {}; // store references for later animation

  function setupJars() {
    const container = document.getElementById("risk-bars");
    container.innerHTML = ""; // Clear any previous content
  
    ["female", "male"].forEach(gender => {
      const color = gender === "female" ? "hotpink" : "steelblue";
  
      // Create container div
      const jarDiv = document.createElement("div");
      jarDiv.classList.add("jar-wrapper");
      jarDiv.style.display = "flex";
      jarDiv.style.flexDirection = "column";
      jarDiv.style.alignItems = "center";
      jarDiv.style.margin = "0 2rem";
  
      // Create SVG
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
  
      // Add gender icon below the SVG
      const icon = document.createElement("div");
      icon.innerHTML = gender === "female" ? `
        <svg xmlns="http://www.w3.org/2000/svg" width="4rem" height="4rem" fill="hotpink"
          class="bi bi-person-standing-dress" viewBox="0 0 16 16">
          <path d="M8 3a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3m-.5 12.25V12h1v3.25a.75.75 0 0 0 
          1.5 0V12h1l-1-5v-.215a.285.285 0 0 1 .56-.078l.793 2.777a.711.711 
          0 1 0 1.364-.405l-1.065-3.461A3 3 0 0 0 8.784 
          3.5H7.216a3 3 0 0 0-2.868 2.118L3.283 9.079a.711.711 
          0 1 0 1.365.405l.793-2.777a.285.285 
          0 0 1 .56.078V7l-1 5h1v3.25a.75.75 0 0 0 1.5 0Z" />
        </svg>` : `
        <svg xmlns="http://www.w3.org/2000/svg" width="4rem" height="4rem" fill="steelblue"
          class="bi bi-person-standing" viewBox="0 0 16 16">
          <path d="M8 3a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 
          3M6 6.75v8.5a.75.75 0 0 0 1.5 0V10.5a.5.5 
          0 0 1 1 0v4.75a.75.75 0 0 0 1.5 0v-8.5a.25.25 
          0 1 1 .5 0v2.5a.75.75 0 0 0 1.5 0V6.5a3 3 
          0 0 0-3-3H7a3 3 0 0 0-3 3v2.75a.75.75 
          0 0 0 1.5 0v-2.5a.25.25 0 0 1 .5 0" />
        </svg>`;
  
      jarDiv.appendChild(icon);
  
      // Append to main container
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
        icon.innerHTML = gender === "female"
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
      globalData = data;  // <--- STORE the data for reuse later
  
      const risk = calculateArrestRisk(data);
      document.getElementById("clean-slate").style.display = "block";
  
      // Step 1: draw the jars (empty)
      setupJars();
  
      // Scroll and animate as before
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
    document.getElementById("calc-tobacco-risk").style.display = "none"; // Hides the button after clicking
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
      }, 50); // slight delay so transition kicks in
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
  container.innerHTML = ""; // clear any previous jars

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
    icon.innerHTML = gender === "female"
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

  // Reveal paragraph + "Continue" after animation
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
  

  // Optional: hide the button after click
  document.getElementById("cigarette-button-container").style.display = "none";
});


document.getElementById("continue-to-cigarettes").addEventListener("click", () => {
  document.getElementById("cigarette-scene").style.display = "block";
  document.getElementById("cigarette-image").style.display = "block";  // <-- show the image
  document.getElementById("cigarette-button-container").style.display = "block";
  document.getElementById("cigarette-scene").scrollIntoView({ behavior: "smooth", block: "center" });
});

document.getElementById("continue-to-alcohol").addEventListener("click", () => {
  const alcoholScene = document.getElementById("alcohol-scene");
  alcoholScene.style.display = "block";

  // You can choose whether to show the image initially or after risk is calculated
  document.getElementById("alcohol-image").style.display = "block";

  alcoholScene.scrollIntoView({ behavior: "smooth", block: "center" });
});





function setupAlcoholJars() {
  const container = document.getElementById("alcohol-risk-bars");
  container.innerHTML = ""; // clear any previous jars

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
    icon.innerHTML = gender === "female"
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


function createHeatmap(data) {
  const cleaned = data.filter(d => {
  const alc = +d.ALCDAYS;
  const dep = +d.DSTDEPRS;

  return (
    (alc >= 0 && alc <= 30) || alc === 91 || alc === 93
  ) && (
    dep >= 1 && dep <= 5
  );
});
  console.log(`Cleaned: ${cleaned}`);
  function binAlcohol(days) {
  if (days === 91 || days === 93) return "0 days";

  if (days <= 5) return "1-5";
  if (days <= 10) return "6-0";
  if (days <= 15) return "11-15";
  if (days <= 20) return "16-20";
  if (days <= 25) return "21-25";
  return "26-30";
}


const counts = d3.rollups(
  cleaned,
  v => v.length,
  d => binAlcohol(+d.ALCDAYS),
  d => +d.DSTDEPRS
);

// Flatten to array of objects
const flattened = counts.flatMap(([bin, levels]) =>
  levels.map(([depLevel, count]) => ({
    bin,
    depLevel,
    count
  }))
);
const bins = [...new Set(flattened.map(d => d.bin))].sort();
const levels = [1, 2, 3, 4, 5];

const xScale = d3.scaleBand().domain(bins).range([0, width]).padding(0.05);
const yScale = d3.scaleBand().domain(levels).range([0, height]).padding(0.05);
const colorScale = d3.scaleSequential(d3.interpolateReds)
  .domain([0, d3.max(flattened, d => d.count)]);

svg.selectAll("rect")
  .data(flattened)
  .enter().append("rect")
    .attr("x", d => xScale(d.bin))
    .attr("y", d => yScale(d.depLevel))
    .attr("width", xScale.bandwidth())
    .attr("height", yScale.bandwidth())
    .attr("fill", d => colorScale(d.count))
    .append("title")
    .text(d => `Bin: ${d.bin}, Depression: ${d.depLevel}, Count: ${d.count}`);
//     data.forEach(function (d) {
//         d.x = +d.ASDSOVRL;
//         d.y = +d.NOBOOKY2;
//     });

//     const margin = { top: 40, right: 20, bottom: 60, left: 60 };
//     const width = 800 - margin.left - margin.right;
//     const height = 400 - margin.top - margin.bottom;

    
//     const svg = d3.select("#scatter-plot").html("")
//         .append("svg")
//         .attr("width", width + margin.left + margin.right)
//         .attr("height", height + margin.top + margin.bottom)
//         .append("g")
//         .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//     //
//     const tooltip = d3.select("body").append("div")
//     .attr("class", "tooltip");


//     const xScale = d3.scaleBand()
//         .domain(data.map(d => d.x))
//         .range([0, width])
//         .padding(0.4);

//     const yScale = d3.scaleLinear()
//         .domain([0, d3.max(data, d => d.y)])
//         .nice()
//         .range([height, 0]);

//     const colorScale = d3.scaleOrdinal()
//        .domain(data.map(d => d.x))
//        .range(d3.schemeCategory10);

//     svg.selectAll(".bar")
//         .data(data)
//         .enter().append("rect")
//         .attr("class", "bar")
//         .attr("x", d => xScale(d.x))
//         .attr("y", d => yScale(d.y))
//         .attr("width", xScale.bandwidth())
//         .attr("height", d => height - yScale(d.y))
//         .attr("fill", d=>colorScale(d.x)).on("mouseover", function (event, d) {
//             tooltip.transition().duration(200).style("opacity", 0.9);
//             tooltip.html(`Severity: ${d.x}<br>Avg Arrests: ${d.y.toFixed(2)}`)
//               .style("left", (event.pageX + 10) + "px")
//               .style("top", (event.pageY - 28) + "px");
//             d3.select(this).attr("fill", "orange");
//           })
//           .on("mouseout", function (event, d) {
//             tooltip.transition().duration(500).style("opacity", 0);
//             d3.select(this).attr("fill", colorScale(d.x));
//           });

//     svg.append("g")
//         .attr("transform", "translate(0," + height + ")")
//         .call(d3.axisBottom(xScale));

//     svg.append("g")
//         .call(d3.axisLeft(yScale));

//     svg.append("text")
//         .attr("text-anchor", "middle")
//         .attr("x", width / 2)
//         .attr("y", height + margin.bottom - 10)
//         .text("Severity of Depression Interference (1 = None, 5 = Severe)");

//     svg.append("text")
//         .attr("text-anchor", "middle")
//         .attr("transform", "rotate(-90)")
//         .attr("x", -height / 2)
//         .attr("y", -margin.left + 20)
//         .text("Average Number of Arrests (Past 12 Months)");

//     svg.append("text")
//         .attr("x", width / 2)
//         .attr("y", -10)
//         .attr("text-anchor", "middle")
//         .style("font-size", "22px")
//         .text("Arrest Frequency by Depression Interference Severity");

// }

// function toggleStats(substance) {
//     const statsDiv = document.getElementById(`${substance}-stats`);
//     const button = document.querySelector(`#spiral-${substance}-controls button`);

//     if (statsDiv.style.display === "none") {
//         statsDiv.style.display = "block";
//         button.textContent = "Hide Stats";
//     } else {
//         statsDiv.style.display = "none";
//         button.textContent = "Show Stats";
//     }
}


document.getElementById("calc-alcohol-risk").addEventListener("click", () => {
  document.getElementById("calc-alcohol-risk").style.display = "none";
  document.getElementById("alcohol-risk-bars").style.display = "flex";
  setupAlcoholJars(); // you’ll create this function just like the other two

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
      icon.innerHTML = gender === "female"
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="4rem" height="4rem" fill="hotpink"
              class="bi bi-person-standing-dress" viewBox="0 0 16 16">
              <path d="M8 3a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3m-.5 12.25V12h1v3.25a.75.75 0 0 0 
              1.5 0V12h1l-1-5v-.215a.285.285 0 0 1 
              .56-.078l.793 2.777a.711.711 0 1 0 1.364-.405l-1.065-3.461A3 3 0 
              0 0 8.784 3.5H7.216a3 3 0 0 0-2.868 2.118L3.283 
              9.079a.711.711 0 1 0 1.365.405l.793-2.777a.285.285 
              0 0 1 .56.078V7l-1 5h1v3.25a.75.75 0 0 0 1.5 0Z"/>
            </svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" width="4rem" height="4rem" fill="steelblue"
              class="bi bi-person-standing" viewBox="0 0 16 16">
              <path d="M8 3a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3M6 
              6.75v8.5a.75.75 0 0 0 1.5 0V10.5a.5.5 
              0 0 1 1 0v4.75a.75.75 0 0 0 1.5 0v-8.5a.25.25 
              0 1 1 .5 0v2.5a.75.75 0 0 0 1.5 0V6.5a3 3 
              0 0 0-3-3H7a3 3 0 0 0-3 3v2.75a.75.75 
              0 0 0 1.5 0v-2.5a.25.25 0 0 1 .5 0"/>
            </svg>`;
      
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
    d.IEMFLAG === "1" && // must have tried illicit non-marijuana drugs
    d.DEPRESSIONINDEX === "0" &&
    d.TOBFLAG === "1" &&
    selectedDrugs.every(drug => d[drug] === "1")
  );

  const arrests = subset.filter(d => d.CRIMEHIST === "1").length;
  return Math.round((arrests / Math.max(subset.length, 1)) * 100);
}

// document.getElementById("calc-drug-risk").addEventListener("click", () => {
//   const checked = [...document.querySelectorAll("#drug-form input:checked")];
//   const selectedDrugs = checked.map(input => input.value);

//   if (selectedDrugs.length === 0) return alert("Select at least one drug.");

//   const risks = calculateHardDrugRisk(globalData, selectedDrugs);

//   // Reuse your jar drawing function (or copy from earlier ones)
//   setupDrugJars(); // define this like your `setupAlcoholJars`
  
//   ["female", "male"].forEach(gender => {
//     const { bar, label, scale } = jarElements[`${gender}-drug`];
//     const target = risks[gender];

//     bar.transition()
//       .duration(1500)
//       .attr("y", 250 - scale(target))
//       .attr("height", scale(target));

//     let percent = 0;
//     const interval = setInterval(() => {
//       if (percent >= target) {
//         clearInterval(interval);
//         label.text(`${target}%`);
//       } else {
//         percent++;
//         label.text(`${percent}%`);
//       }
//     }, 1500 / Math.max(target, 1));
//   });

//   // setTimeout(() => {
//   //   document.getElementById("drug-risk-bars").style.display = "flex";
//   //   document.getElementById("drug-followup-wrapper").style.display = "block";
//   //   document.getElementById("drug-followup").innerText = `Their risk jumped again after trying ${selectedDrugs.length > 1 ? "multiple drugs" : "one drug"}.`;
//   // }, 1000);
//   setTimeout(() => {
//     const riskBars = document.getElementById("drug-risk-bars");
//     riskBars.style.display = "flex";
  
//     // Smooth scroll to the risk bars
//     riskBars.scrollIntoView({
//       behavior: "smooth",
//       block: "center"
//     });
  
//     document.getElementById("drug-followup-wrapper").style.display = "block";
//     document.getElementById("drug-followup").innerText =
//       `Their risk jumped again after trying ${selectedDrugs.length > 1 ? "multiple drugs" : "one drug"}.`;
//   }, 1000);
  
// });

document.getElementById("calc-drug-risk").addEventListener("click", () => {
  const checked = [...document.querySelectorAll("#drug-form input:checked")];
  const selectedDrugs = checked.map(input => input.value);

  if (selectedDrugs.length === 0) return alert("Select at least one drug.");

  const risks = calculateHardDrugRisk(globalData, selectedDrugs);
  setupDrugJars(); // draw empty jars

  const riskBars = document.getElementById("drug-risk-bars");
  riskBars.style.display = "flex";

  // Smooth scroll first
  riskBars.scrollIntoView({ behavior: "smooth", block: "center" });

  // After scrolling, animate jars
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

    // Show follow-up text
    const followup = document.getElementById("drug-followup-wrapper");
    followup.style.display = "block";
    document.getElementById("drug-followup").innerText =
      `Their risk jumped again after trying ${selectedDrugs.length > 1 ? "multiple drugs" : "one drug"}.`;
  }, 1000); // Delay for scroll
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
    icon.innerHTML = gender === "female"
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

    jarDiv.appendChild(icon);
    container.appendChild(jarDiv);

    jarElements[`${gender}-drug`] = { bar, label, scale };
  });
}

// ////////  Heat Maps /////////
// const xAxisLabels = {
//     alcoholDays: "Consumed Alcohol",
//     chewDays: "Chewed Tobacco",
//     marijuanaDays: "Consumed Marijuana",
//     workDaysMissed: "Work Days Missed"
// };

// const svgMale = d3.select("#male-heatmap")
//     .append("svg")
//     .attr("width", width + margin.left + margin.right)
//     .attr("height", height + margin.top + margin.bottom)
//     .style("display", "block")
//     .style("margin", "0 auto")
//     .append("g")
//     .attr("transform", `translate(${margin.left},${margin.top})`);

// const svgFemale = d3.select("#female-heatmap")
//     .append("svg")
//     .attr("width", width + margin.left + margin.right)
//     .attr("height", height + margin.top + margin.bottom)
//     .style("display", "block")
//     .style("margin", "0 auto")
//     .append("g")
//     .attr("transform", `translate(${margin.left},${margin.top})`);

// d3.tsv("data/merged_clean.tsv").then(data => {
//     console.log("Raw data loaded:", data.slice(0, 5));

//     const renamedData = data.map(d => {

//         let alcoholDays = +d.ALCDAYS;
//         if (alcoholDays === 91) {
//             alcoholDays = 0;
//         } else if ([93, 94, 97, 98, 99].includes(alcoholDays)) {
//             alcoholDays = null;
//         }

//         let chewDays = +d.CHW30USE;
//         if (chewDays === 91) {
//             chewDays = 0;
//         } else if ([93, 94, 97, 98, 99].includes(chewDays)) {
//             chewDays = null;
//         }

//         let marijuanaDays = +d.MJDAY30A;
//         if (marijuanaDays === 91) {
//             marijuanaDays = 0;
//         } else if ([93, 94, 97, 98, 99].includes(marijuanaDays)) {
//             marijuanaDays = null;
//         }

//         let workDaysMissed = +d.WORKDAYS;
//         if (workDaysMissed === 91) {
//             workDaysMissed = 0;
//         } else if ([93, 94, 97, 98, 99].includes(workDaysMissed)) {
//             workDaysMissed = null;
//         }

//         let depressionFrequency = +d.DSTDEPRS;
//         if (depressionFrequency === 91) {
//             depressionFrequency = 0;
//         } else if ([93, 94, 97, 98, 99].includes(depressionFrequency)) {
//             depressionFrequency = null;
//         }

//         return {
//             gender: +d.GENDER_R,
//             timesArrested: +d.NOBOOKY2,
//             alcoholDays: alcoholDays !== null && alcoholDays >= 0 && alcoholDays <= 30 ? group(alcoholDays) : null,
//             chewDays: chewDays !== null && chewDays >= 0 && chewDays <= 30 ? group(chewDays) : null,
//             marijuanaDays: marijuanaDays !== null && marijuanaDays >= 0 && marijuanaDays <= 30 ? group(marijuanaDays) : null,
//             workDaysMissed: workDaysMissed !== null && workDaysMissed >= 0 && workDaysMissed <= 30 ? group(workDaysMissed) : null,
//             depressionFrequency: +d.DSTDEPRS
//         };
//     });


//     const maleData = renamedData.filter(d => d.gender === 1);
//     const femaleData = renamedData.filter(d => d.gender === 0);

//     const xAxisOptions = ["alcoholDays", "chewDays", "marijuanaDays", "workDaysMissed"];


//     const dropdown = d3.select("#dropdownId");

//     dropdown.on("change", function () {
//         const selectedX = dropdown.property("value");
//         console.log("Dropdown value changed:", selectedX);
//         updateHeatmaps(selectedX);
//     });

//     dropdown.selectAll("option")
//         .data(xAxisOptions)
//         .enter()
//         .append("option")
//         .text(d => d)
//         .attr("value", d => d);

//     window.maleData = maleData;
//     window.femaleData = femaleData;

//     drawHeatmap(svgMale, maleData, "Male", "alcoholDays");
//     drawHeatmap(svgFemale, femaleData, "Female", "alcoholDays");
// });

// function updateHeatmaps(selectedX) {
//     console.log("Selected X:", selectedX);
//     svgMale.selectAll("*").remove();
//     svgFemale.selectAll("*").remove();
//     drawHeatmap(svgMale, window.maleData, "Male", selectedX);
//     drawHeatmap(svgFemale, window.femaleData, "Female", selectedX);
// }

// function drawHeatmap(svg, dataset, label, selectedX) {

//     const desiredOrder = ["0", "1-5", "6-10", "11-15", "16-20", "21-25", "26-30"];

//     const xAxisValues = Array.from(new Set(dataset
//         .map(d => d[selectedX])
//         .filter(v => v !== null)
//     )).sort((a, b) => desiredOrder.indexOf(a) - desiredOrder.indexOf(b));


//     const yAxisValues = Array.from(
//         new Set(dataset.map(d => d.timesArrested).filter(v => v >= 0 && v <= 50))
//     ).sort((a, b) => a - b);

//     const size = 500;
//     const cellSize = 40

//     const correlations = [];

//     yAxisValues.forEach((yVal) => {
//         xAxisValues.forEach((xVal) => {
//             const subset = dataset.filter(d => d.timesArrested === yVal && d[selectedX] === xVal);
//             const avgDepressionFrequency = d3.mean(subset.map(d => d.depressionFrequency));
//             correlations.push({ x: xVal, y: yVal, value: avgDepressionFrequency });
//         });
//     });

//     const colorScale = d3.scaleSequential(d3.interpolateRdBu)
//         .domain([d3.max(correlations, d => d.value), d3.min(correlations, d => d.value)]);

//     // svg.append("text")
//     //     .attr("x", width / 2 + margin.left - 120)
//     //     .attr("y", -50)
//     //     .attr("text-anchor", "middle")
//     //     .text(`${label} - Arrests vs ${xAxisLabels[selectedX]} (Depression Frequency)`)
//     //     .style("font-size", "30px");

//     svg.selectAll("rect")
//         .data(correlations)
//         .enter()
//         .append("rect")
//         .attr("x", d => xAxisValues.indexOf(d.x) * cellSize + margin.left)
//         .attr("y", d => yAxisValues.indexOf(d.y) * cellSize + margin.top)
//         .attr("width", cellSize)
//         .attr("height", cellSize)
//         .style("fill", d => colorScale(d.value))
//         .attr("class", "cell")
//         .on("mouseover", function (event, d) {
//             d3.select("#tooltip1")
//                 .style("opacity", 1)
//                 .html(`${xAxisLabels[selectedX]}: ${d.x}<br>Arrests: ${d.y}<br>Avg Depression: ${d.value !== undefined ? d.value.toFixed(2) : "N/A"}`);
//         })
//         .on("mousemove", function (event) {
//             d3.select("#tooltip1")
//                 .style("left", (event.pageX + 10) + "px")
//                 .style("top", (event.pageY - 20) + "px");
//         })
//         .on("mouseout", function () {
//             d3.select("#tooltip1")
//                 .style("opacity", 0);
//         });


//     svg.selectAll(".label-x")
//         .data(xAxisValues)
//         .enter()
//         .append("text")
//         .attr("x", (d, i) => i * cellSize + cellSize / 2 - 40)
//         .attr("y", yAxisValues.length * cellSize + margin.top - 5)
//         .text(d => d)
//         .attr("text-anchor", "start")
//         .attr("transform", (d, i) => {
//             const x = i * cellSize + cellSize / 2;
//             const y = height + 20;
//             return `rotate(45, ${x}, ${y})`;
//         })
//         .style("font-size", "12px")
//         .attr("class", "axis-label");

//     svg.selectAll(".label-y")
//         .data(yAxisValues)
//         .enter()
//         .append("text")
//         .attr("y", (d, i) => i * cellSize + margin.top + cellSize / 2)
//         .attr("x", 70)
//         .text(d => d)
//         .attr("text-anchor", "end")
//         .attr("alignment-baseline", "middle")
//         .attr("class", "axis-label")
//         .style("font-size", "12px");

//     const defs = svg.append("defs");
//     const gradient = defs.append("linearGradient")
//         .attr("id", `legend-gradient-${label}`)
//         .attr("x1", "0%").attr("y1", "0%")
//         .attr("x2", "100%").attr("y2", "0%");

//     const minVal = d3.min(correlations, d => d.value);
//     const maxVal = d3.max(correlations, d => d.value);
//     const steps = 10;
//     for (let i = 0; i <= steps; i++) {
//         const t = i / steps;
//         gradient.append("stop")
//             .attr("offset", `${t * 100}%`)
//             .attr("stop-color", colorScale(minVal + t * (maxVal - minVal)));
//     }

//     svg.append("text")
//         .attr("x", (xAxisValues.length * cellSize) / 2 + 100)
//         .attr("y", yAxisValues.length * cellSize + margin.top + 120)
//         .attr("text-anchor", "middle")
//         .text(`Number of Days ${xAxisLabels[selectedX]} in Past 30 Days`)
//         .style("font-size", "14px")
//         .style("font-weight", "bold");

//     svg.append("text")
//         .attr("text-anchor", "middle")
//         .attr("transform", `translate(-70, ${(yAxisValues.length * cellSize) / 2 + margin.top}) rotate(-90)`)
//         .text("Number of Times Arrested and Booked in Past 12 Months")
//         .style("font-size", "14px")
//         .style("font-weight", "bold");

//     const legendWidth = 200;
//     const legendHeight = 20;

//     svg.append("rect")
//         .attr("x", (width - legendWidth) / 2 + margin.left - 200)
//         .attr("y", height + margin.top - 50)
//         .attr("width", legendWidth)
//         .attr("height", legendHeight)
//         .style("fill", `url(#legend-gradient-${label})`);

//     const legendScale = d3.scaleLinear()
//         .domain([minVal, maxVal])
//         .range([(width - legendWidth) / 2 + margin.left, (width + legendWidth) / 2 + margin.left]);

//     const legendAxis = d3.axisBottom(legendScale)
//         .ticks(5)
//         .tickFormat(d3.format(".2f"));

//     svg.append("g")
//         .attr("transform", `translate(0, ${height + margin.top + 70})`)
//         .call(legendAxis);

//     svg.append("text")
//         .attr("x", width / 2 + margin.left - 200)
//         .attr("y", height + margin.top - 80)
//         .attr("text-anchor", "middle")
//         .text("Increasing Average Depression Frequency ➔")
//         .style("font-size", "14px")
//         .style("font-weight", "bold");
// }

// function group(day) {
//     if (day === 0) return "0";
//     if (day >= 1 && day <= 5) return "1-5";
//     if (day >= 6 && day <= 10) return "6-10";
//     if (day >= 11 && day <= 15) return "11-15";
//     if (day >= 16 && day <= 20) return "16-20";
//     if (day >= 21 && day <= 25) return "21-25";
//     if (day >= 26 && day <= 30) return "26-30";
//     return null;
// }

// /////////  Donut Charts ////////

// function drawBarChart(csvPath, elementId, genderLabel) {
//     console.log(`Running drawBarChart for ${elementId}`);

//     const width = 400;
//     const height = 300;
//     const margin = { top: 40, right: 20, bottom: 80, left: 60 };

//     const svg = d3.select(`#${elementId}`)
//         .append("svg")
//         .attr("width", width)
//         .attr("height", height);

//     const tooltip = d3.select("#tooltip100");

//     d3.csv(csvPath).then(data => {
//         data.forEach(d => d.value = +d.AvgCIG30USE);

//         const xScale = d3.scaleBand()
//             .domain(data.map(d => d.Behavior))
//             .range([margin.left, width - margin.right])
//             .padding(0.3);

//         const yScale = d3.scaleLinear()
//             .domain([0, d3.max(data, d => d.value)])
//             .nice()
//             .range([height - margin.bottom, margin.top]);

//         const color = d3.scaleOrdinal()
//             .domain(data.map(d => d.Behavior))
//             .range(d3.schemeSet2);

//         svg.append("g")
//             .attr("transform", `translate(0, ${height - margin.bottom})`)
//             .call(d3.axisBottom(xScale))
//             .selectAll("text")
//             .attr("transform", "rotate(-45)")
//             .style("text-anchor", "end");

//         svg.append("g")
//             .attr("transform", `translate(${margin.left}, 0)`)
//             .call(d3.axisLeft(yScale));

//         svg.selectAll("rect")
//             .data(data)
//             .enter()
//             .append("rect")
//             .attr("x", d => xScale(d.Behavior))
//             .attr("y", d => yScale(d.value))
//             .attr("width", xScale.bandwidth())
//             .attr("height", d => height - margin.bottom - yScale(d.value))
//             .attr("fill", d => color(d.Behavior))
//             .on("mouseover", function (event, d) {
//                 tooltip
//                     .style("visibility", "visible")
//                     .html(`
//                         <div style="font-size: 13px;">
//                             <strong>Behavior:</strong> ${d.Behavior}<br>
//                             <strong>Avg Cigarette Days:</strong> ${d.value}
//                         </div>`);
//             })
//             .on("mousemove", function (event) {
//                 tooltip
//                     .style("left", `${event.pageX + 10}px`)
//                     .style("top", `${event.pageY - 28}px`);
//             })
//             .on("mouseout", function () {
//                 tooltip.style("visibility", "hidden");
//             });

        
            
//     });
// }

// drawBarChart("data/donut_male.csv", "male-smoked", "Male");
// drawBarChart("data/donut_female.csv", "female-smoked", "Female");

// ////////  Spiral Graph  /////////
// const svgAlcohol = d3.select('#spiral-alcohol')
//     .append('svg')
//     .attr('width', 600)
//     .attr('height', 600)
//     .append('g')
//     .attr('transform', `translate(${600 / 2 - 100},${600 / 2})`);

// const svgMarijuana = d3.select('#spiral-mj')
//     .append('svg')
//     .attr('width', 600)
//     .attr('height', 600)
//     .append('g')
//     .attr('transform', `translate(${600 / 2 - 100},${600 / 2})`);

// const spiralArc = (fromRadius, toRadius, width, fromAngle, toAngle) => {
//     const x1 = fromRadius * Math.sin(fromAngle);
//     const y1 = fromRadius * -Math.cos(fromAngle);
//     const x2 = (fromRadius + width) * Math.sin(fromAngle);
//     const y2 = (fromRadius + width) * -Math.cos(fromAngle);
//     const x3 = toRadius * Math.sin(toAngle);
//     const y3 = toRadius * -Math.cos(toAngle);
//     const x4 = (toRadius + width) * Math.sin(toAngle);
//     const y4 = (toRadius + width) * -Math.cos(toAngle);
//     return `
//           M ${x1},${y1} 
//           L ${x2},${y2} 
//           A ${fromRadius},${fromRadius} 1 0 1 ${x4},${y4} 
//           L ${x3},${y3}
//           A ${fromRadius},${fromRadius} 0 0 0 ${x1},${y1}`;
// };

// function createVis(svg, maleCounts, femaleCounts, caseScale, labelPrefix) {
//     const BASE_RADIUS = 30;
//     const numSpins = 2;
//     const segments = 30;
//     const totalAngle = numSpins * Math.PI * 2;
//     const radiusGrowthPerRad = 15;

//     for (let day = 1; day <= 30; day++) {
//         const angle = (day / segments) * totalAngle;
//         const dayWidth = totalAngle / segments;

//         const fromAngleM = angle - dayWidth / 4;
//         const toAngleM = angle;
//         const fromAngleF = angle;
//         const toAngleF = angle + dayWidth / 4;

//         const baseRadius = BASE_RADIUS + radiusGrowthPerRad * angle;

//         const heightM = caseScale(maleCounts[day]);
//         const pathM = spiralArc(baseRadius, baseRadius, heightM, fromAngleM, toAngleM);

//         svg.append('path')
//             .attr('d', pathM)
//             .style('fill', "steelblue")
//             .style('opacity', 0.8)
//             .on('mouseover', function (event) {
//                 d3.select("#tooltip")
//                     .style("display", "block")
//                     .style("left", (event.pageX + 10) + "px")
//                     .style("top", (event.pageY - 20) + "px")
//                     .html(`<strong>${labelPrefix} - Male</strong><br><strong># Days Used:</strong> ${day}<br><strong>People:</strong> ${maleCounts[day]}`);
//             })
//             .on('mousemove', function (event) {
//                 d3.select("#tooltip")
//                     .style("left", (event.pageX + 10) + "px")
//                     .style("top", (event.pageY - 20) + "px");
//             })
//             .on('mouseout', function () {
//                 d3.select("#tooltip").style("display", "none");
//             });

//         const heightF = caseScale(femaleCounts[day]);
//         const pathF = spiralArc(baseRadius, baseRadius, heightF, fromAngleF, toAngleF);

//         svg.append('path')
//             .attr('d', pathF)
//             .style('fill', "palevioletred")
//             .style('opacity', 0.8)
//             .on('mouseover', function (event) {
//                 d3.select("#tooltip")
//                     .style("display", "block")
//                     .style("left", (event.pageX + 10) + "px")
//                     .style("top", (event.pageY - 20) + "px")
//                     .html(`<strong>${labelPrefix} - Female</strong><br><strong>Day:</strong> ${day}<br><strong>People:</strong> ${femaleCounts[day]}`);
//             })
//             .on('mousemove', function (event) {
//                 d3.select("#tooltip")
//                     .style("left", (event.pageX + 10) + "px")
//                     .style("top", (event.pageY - 20) + "px");
//             })
//             .on('mouseout', function () {
//                 d3.select("#tooltip").style("display", "none");
//             });
//     }

//     for (let day = 1; day <= 30; day += 2) {
//         const angle = (day / segments) * totalAngle;
//         const radius = BASE_RADIUS + radiusGrowthPerRad * angle + 30;

//         const x = radius * Math.sin(angle);
//         const y = radius * -Math.cos(angle);

//         svg.append('text')
//             .attr('x', x)
//             .attr('y', y)
//             .text(day)
//             .attr('text-anchor', 'middle')
//             .attr('alignment-baseline', 'middle')
//             .style('font-size', '12px')
//             .style('font-weight', 'bold')
//             .style('fill', 'black');
//     }
// }

// ////////////// Bar Chart: Justice Involvement by Drug Use //////////
// function drawMovingBarGraph(data) {
//     const drugs = [
//         { name: "Heroin", field: "HEREVER" },
//         { name: "Cocaine", field: "COCEVER" },
//         { name: "Crack", field: "CRKEVER" },
//         { name: "LSD", field: "LSD" },
//         { name: "PCP", field: "PCP" },
//         { name: "Ecstasy", field: "ECSTASY" }
//     ];

//     const results = drugs.map(drug => {
//         const users = data.filter(d => +d[drug.field] === 1);
//         const nonUsers = data.filter(d => +d[drug.field] === 0);
//         const justiceInvolvement = d => (+d.BOOKED === 1 || +d.PROBATON === 1 || +d.PAROLREL === 1);

//         return {
//             drug: drug.name,
//             userJusticeRate: users.length ? (users.filter(justiceInvolvement).length / users.length) * 100 : 0,
//             nonUserJusticeRate: nonUsers.length ? (nonUsers.filter(justiceInvolvement).length / nonUsers.length) * 100 : 0
//         };
//     });

//     const svg = d3.select("#vis-moving")
//         .append("svg")
//         .attr("width", 900)
//         .attr("height", 400)
//         .append("g")
//         .attr("transform", "translate(150,50)");

//     const y = d3.scaleLinear()
//         .domain([0, 100])
//         .range([300, 0]);

//     const x = d3.scaleBand()
//         .domain(["Never Used", "Used"])
//         .range([0, 300])
//         .padding(0.4);

//     const color = d3.scaleOrdinal()
//         .domain(["Never Used", "Used"])
//         .range(["lightblue", "firebrick"]);

//     svg.append("g")
//         .attr("transform", "translate(0,300)")
//         .call(d3.axisBottom(x))
//         .selectAll("text")
//         .style("font-size", "13px")
//         .style("font-weight", "bold");


//     svg.append("g")
//         .call(d3.axisLeft(y));

//     svg.append("text")
//         .attr("text-anchor", "middle")
//         .attr("transform", "rotate(-90)")
//         .attr("x", -150)
//         .attr("y", -40)
//         .text("(%) Who Have Been Arrested / Probation / Parole")
//         .style("font-size", "14px")
//         .style("font-weight", "bold")
//         .style("fill", "black");

//     const legend = svg.append("g")
//         .attr("transform", "translate(350, 30)");

//     legend.append("rect")
//         .attr("x", 0)
//         .attr("y", 0)
//         .attr("width", 15)
//         .attr("height", 15)
//         .attr("fill", "lightblue");

//     legend.append("text")
//         .attr("x", 20)
//         .attr("y", 12)
//         .text("Never used this substance in their life")
//         .style("font-size", "12px")
//         .style("font-weight", "bold");

//     legend.append("rect")
//         .attr("x", 0)
//         .attr("y", 30)
//         .attr("width", 15)
//         .attr("height", 15)
//         .attr("fill", "firebrick");

//     legend.append("text")
//         .attr("x", 20)
//         .attr("y", (d, i) => i * 20 + 12)
//         .text(d => d)
//         .style("font-size", "12px");
// }


// function drawGenderArrestComparison() {
//     const margin = { top: 40, right: 30, bottom: 80, left: 60 };
//     const width = 700 - margin.left - margin.right;
//     const height = 500 - margin.top - margin.bottom;

//     d3.select("#graph-about-arrest").html(`
//         <div class="filter-controls">
//             <select id="crime-filter">
//                 <option value="ALL">All Arrests</option>
//                 <option value="VIOLENT">Violent Crimes</option>
//                 <option value="DRUG">Drug Crimes</option>
//             </select>
//         </div>
//         <div class="chart-area"></div>
//     `);

//     const svg = d3.select("#graph-about-arrest .chart-area")
//         .append("svg")
//         .attr("width", width + margin.left + margin.right)
//         .attr("height", height + margin.top + margin.bottom)
//         .append("g")
//         .attr("transform", `translate(${margin.left},${margin.top})`);

//     d3.tsv("data/male_vs_female_arrest.tsv").then(rawData => {
//         const data = rawData.map(d => {
//             return {
//                 ...d,
//                 IRSEX: +d.IRSEX || 0,
//                 BOOKED: (+d.BOOKED === 1 || +d.BOOKED === 3) ? 1 : 0,
//                 BKAGASLT: (+d.BKAGASLT === 1 || +d.BKAGASLT === 3) ? 1 : 0,
//                 isValid: (+d.IRSEX === 1 || +d.IRSEX === 2) && 
//                         (+d.BOOKED === 0 || +d.BOOKED === 1) &&
//                         !isNaN(+d.BKAGASLT) 

//             };
//         }).filter(d => d.isValid);

//         function updateChart(crimeFilter = "ALL") {
//             const filteredData = data.filter(d => {
//                 if (crimeFilter === "VIOLENT") return d.BKAGASLT === 1;
//                 return true;
//             });
//             const groupData = (genderCode) => {
//                 const gender = genderCode === 1 ? "Male" : "Female";
//                 const group = filteredData.filter(d => d.IRSEX === genderCode);
                
//                 if (group.length === 0) {
//                     return {
//                         gender,
//                         rate: 0,
//                         lower: 0,
//                         upper: 0,
//                         count: 0,
//                         total: 0,
//                         hasData: false
//                     };
//                 }

//                 const rate = group.length > 0 ? (group.length/filteredData.length) * 100 : 0;
//                 const se = group.length > 0 ? 1.96 * Math.sqrt((rate * (100 - rate)) / group.length) : 0;
                
//                 return {
//                     gender,
//                     rate,
//                     lower: Math.max(0, rate - se),
//                     upper: Math.min(100, rate + se),
//                     count: group.length,
//                     total: filteredData.length,
//                     hasData: group.length > 0
//                 };
//             };

//             const chartData = [
//                 groupData(1),
//                 groupData(2)
//             ];
//             console.log(chartData[0])
//             console.log( chartData[1])

//             const maxRate = Math.max(
//                 10, 
//                 d3.max(chartData, d => d.upper),
//                 d3.max(chartData, d => d.rate)
//             );

//             const x = d3.scaleLinear()
//                 .domain([0, maxRate])
//                 .range([0, width])
//                 .nice();

//             const y = d3.scaleBand()
//                 .domain(chartData.map(d => d.gender))
//                 .range([0, height])
//                 .padding(0.4);

//             svg.selectAll("*").remove();

//             svg.selectAll(".bar")
//                 .data(chartData)
//                 .enter()
//                 .append("rect")
//                 .attr("class", "bar")
//                 .attr("y", d => y(d.gender))
//                 .attr("height", y.bandwidth())
//                 .attr("x", 0)
//                 .attr("width", d => x(d.rate))
//                 .attr("fill", d => d.gender === "Male" ? "#1f77b4" : "#e377c2")
//                 .on("mouseover", showTooltip)
//                 .on("mousemove", moveTooltip)
//                 .on("mouseout", hideTooltip);


//             svg.selectAll(".label")
//                 .data(chartData)
//                 .enter()
//                 .append("text")
//                 .attr("class", "label")
//                 .attr("x", d => x(d.rate) + 5)
//                 .attr("y", d => y(d.gender) + y.bandwidth()/2)
//                 .attr("dy", "0.35em")
//                 .style("font-size", "12px")
//                 .style("font-weight", "bold")
//                 .text(d => d.hasData ? `${d.rate.toFixed(1)}%` : "No data");

//             svg.append("g")
//                 .attr("class", "x-axis")
//                 .attr("transform", `translate(0,${height})`)
//                 .call(d3.axisBottom(x).ticks(5).tickFormat(d => `${d}%`));

//             svg.append("g")
//                 .attr("class", "y-axis")
//                 .call(d3.axisLeft(y));

//             svg.append("text")
//                 .attr("class", "title")
//                 .attr("x", width/2)
//                 .attr("y", -10)
//                 .attr("text-anchor", "middle")
//                 .style("font-size", "16px")
//                 .style("font-weight", "bold")
//                 .text(() => {
//                     const filter = d3.select("#crime-filter").node().value;
//                     let subtitle = "";
//                     if (filter === "VIOLENT") subtitle = " (Aggravated Assault)";
//                     if (filter === "DRUG") subtitle = " (Drug Offenses)";
//                     return `Arrest Rates by Gender${subtitle}`;
//                 });
//         }

//         function showTooltip(event, d) {
//             if (!d.hasData) return;
            
//             const filter = d3.select("#crime-filter").node().value;
//             let crimeType = "";
//             if (filter === "VIOLENT") crimeType = "Aggravated Assault Cases";
//             if (filter === "DRUG") crimeType = "Drug Offense Cases";
            
//             d3.select("#tooltip")
//                 .style("opacity", 1)
//                 .html(`
//                     <strong>${d.gender} Arrests</strong><br>
//                     ${crimeType || "All Arrest Cases"}<br>
//                     Arrest Rate: ${d.rate.toFixed(1)}%<br>
//                     95% Confidence: ${d.lower.toFixed(1)}% - ${d.upper.toFixed(1)}%<br>
//                     ${d.count} arrested out of ${d.total} cases
//                 `);
//         }

//         function moveTooltip(event) {
//             d3.select("#tooltip")
//                 .style("left", (event.pageX + 10) + "px")
//                 .style("top", (event.pageY - 20) + "px");
//         }

//         function hideTooltip() {
//             d3.select("#tooltip").style("opacity", 0);
//         }

//         updateChart();
//         d3.select("#crime-filter").on("change", function() {
//             updateChart(this.value);
//         });
//     }).catch(error => {
//         console.error("Error loading data:", error);
//         d3.select("#visualization-container")
//             .append("div")
//             .style("color", "red")
//             .text("Error loading data. Please check the console for details.");
//     });
// }

// ////////////// Bar Chart: Justice Involvement by Drug Use //////////
// function drawMovingBarGraph(data) {
//     const drugs = [
//         { name: "Heroin", field: "HEREVER" },
//         { name: "Cocaine", field: "COCEVER" },
//         { name: "Crack", field: "CRKEVER" },
//         { name: "LSD", field: "LSD" },
//         { name: "PCP", field: "PCP" },
//         { name: "Ecstasy", field: "ECSTASY" }
//     ];

//     const results = drugs.map(drug => {
//         const users = data.filter(d => +d[drug.field] === 1);
//         const nonUsers = data.filter(d => +d[drug.field] === 0);
//         const justiceInvolvement = d => (+d.BOOKED === 1 || +d.PROBATON === 1 || +d.PAROLREL === 1);

//         return {
//             drug: drug.name,
//             userJusticeRate: users.length ? (users.filter(justiceInvolvement).length / users.length) * 100 : 0,
//             nonUserJusticeRate: nonUsers.length ? (nonUsers.filter(justiceInvolvement).length / nonUsers.length) * 100 : 0
//         };
//     });

//     const svg = d3.select("#vis-moving")
//         .append("svg")
//         .attr("width", 800)
//         .attr("height", 400)
//         .append("g")
//         .attr("transform", "translate(150,50)");

//     const y = d3.scaleLinear()
//         .domain([0, 100])
//         .range([300, 0]);

//     const x = d3.scaleBand()
//         .domain(["Never Used", "Used"])
//         .range([0, 300])
//         .padding(0.4);

//     const color = d3.scaleOrdinal()
//         .domain(["Never Used", "Used"])
//         .range(["lightblue", "firebrick"]);

//     svg.append("g")
//         .attr("transform", "translate(0,300)")
//         .call(d3.axisBottom(x).tickFormat(''))
//         .selectAll("text")
//         .style("font-size", "13px")
//         .style("font-weight", "bold");

//     svg.append("g")
//         .call(d3.axisLeft(y));

//     svg.append("text")
//         .attr("text-anchor", "middle")
//         .attr("transform", "rotate(-90)")
//         .attr("x", -150)
//         .attr("y", -40)
//         .text("% With Criminal History")
//         .style("font-size", "14px")
//         .style("font-weight", "bold")
//         .style("fill", "black");

//     const legend = svg.append("g")
//         .attr("transform", "translate(350, 10)");

//     legend.append("rect")
//         .attr("x", 0)
//         .attr("y", 0)
//         .attr("width", 15)
//         .attr("height", 15)
//         .attr("fill", "lightblue");

//     legend.append("text")
//         .attr("x", 20)
//         .attr("y", 12)
//         .text("Never used this substance in their life")
//         .style("font-size", "12px")
//         .style("font-weight", "bold");

//     legend.append("rect")
//         .attr("x", 0)
//         .attr("y", 30)
//         .attr("width", 15)
//         .attr("height", 15)
//         .attr("fill", "firebrick");

//     legend.append("text")
//         .attr("x", 20)
//         .attr("y", 42)
//         .text("Used this substance at least once in their life")
//         .style("font-size", "12px")
//         .style("font-weight", "bold");

//     const drugTitle = svg.append("text")
//         .attr("x", 150)
//         .attr("y", 10)
//         .attr("text-anchor", "middle")
//         .style("font-size", "20px")
//         .style("font-weight", "bold")
//         .text("");

//     let currentIndex = 0;

//     function update() {
//         const drug = results[currentIndex];

//         drugTitle.text(drug.drug);

//         const barData = [
//             { group: "Never Used", value: drug.nonUserJusticeRate },
//             { group: "Used", value: drug.userJusticeRate }
//         ];

//         const bars = svg.selectAll(".bar")
//             .data(barData, d => d.group);

//         bars.enter()
//             .append("rect")
//             .attr("class", "bar")
//             .attr("x", d => x(d.group))
//             .attr("width", x.bandwidth())
//             .attr("y", y(0))
//             .attr("height", d => 300 - y(0))
//             .attr("fill", d => color(d.group))
//             .merge(bars)
//             .transition()
//             .duration(1000)
//             .attr("y", d => y(d.value))
//             .attr("height", d => 300 - y(d.value));

//         bars.exit().remove();

//         const labels = svg.selectAll(".bar-label")
//             .data(barData, d => d.group);

//         labels.enter()
//             .append("text")
//             .attr("class", "bar-label")
//             .attr("x", d => x(d.group) + x.bandwidth() / 2)
//             .attr("y", y(0) - 5)
//             .text(d => `${d.value.toFixed(1)}%`)
//             .attr("text-anchor", "middle")
//             .style("font-size", "14px")
//             .style("fill", "black")
//             .merge(labels)
//             .transition()
//             .duration(1000)
//             .attr("y", d => y(d.value) - 5)
//             .tween("text", function (d) {
//                 const that = d3.select(this);
//                 const i = d3.interpolateNumber(parseFloat(that.text()), d.value);
//                 return function (t) {
//                     that.text(i(t).toFixed(1) + "%");
//                 };
//             });

//         labels.exit().remove();
//     }

//     update();

//     setInterval(() => {
//         currentIndex = (currentIndex + 1) % results.length;
//         update();
//     }, 3000);
// }

// function createBarChart(data) {
//     data.forEach(function (d) {
//         d.x = +d.ASDSOVRL;
//         d.y = +d.NOBOOKY2;
//     });

//     const margin = { top: 40, right: 20, bottom: 60, left: 60 };
//     const width = 800 - margin.left - margin.right;
//     const height = 400 - margin.top - margin.bottom;

    
//     const svg = d3.select("#scatter-plot").html("")
//         .append("svg")
//         .attr("width", width + margin.left + margin.right)
//         .attr("height", height + margin.top + margin.bottom)
//         .append("g")
//         .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//     //
//     const tooltip = d3.select("body").append("div")
//     .attr("class", "tooltip");


//     const xScale = d3.scaleBand()
//         .domain(data.map(d => d.x))
//         .range([0, width])
//         .padding(0.4);

//     const yScale = d3.scaleLinear()
//         .domain([0, d3.max(data, d => d.y)])
//         .nice()
//         .range([height, 0]);

//     const colorScale = d3.scaleOrdinal()
//        .domain(data.map(d => d.x))
//        .range(d3.schemeCategory10);

//     svg.selectAll(".bar")
//         .data(data)
//         .enter().append("rect")
//         .attr("class", "bar")
//         .attr("x", d => xScale(d.x))
//         .attr("y", d => yScale(d.y))
//         .attr("width", xScale.bandwidth())
//         .attr("height", d => height - yScale(d.y))
//         .attr("fill", d=>colorScale(d.x)).on("mouseover", function (event, d) {
//             tooltip.transition().duration(200).style("opacity", 0.9);
//             tooltip.html(`Severity: ${d.x}<br>Avg Arrests: ${d.y.toFixed(2)}`)
//               .style("left", (event.pageX + 10) + "px")
//               .style("top", (event.pageY - 28) + "px");
//             d3.select(this).attr("fill", "orange");
//           })
//           .on("mouseout", function (event, d) {
//             tooltip.transition().duration(500).style("opacity", 0);
//             d3.select(this).attr("fill", colorScale(d.x));
//           });

//     svg.append("g")
//         .attr("transform", "translate(0," + height + ")")
//         .call(d3.axisBottom(xScale));

//     svg.append("g")
//         .call(d3.axisLeft(yScale));

//     svg.append("text")
//         .attr("text-anchor", "middle")
//         .attr("x", width / 2)
//         .attr("y", height + margin.bottom - 10)
//         .text("Severity of Depression Interference (1 = None, 5 = Severe)");

//     svg.append("text")
//         .attr("text-anchor", "middle")
//         .attr("transform", "rotate(-90)")
//         .attr("x", -height / 2)
//         .attr("y", -margin.left + 20)
//         .text("Average Number of Arrests (Past 12 Months)");

//     svg.append("text")
//         .attr("x", width / 2)
//         .attr("y", -10)
//         .attr("text-anchor", "middle")
//         .style("font-size", "22px")
//         .text("Arrest Frequency by Depression Interference Severity");

// }

// function toggleStats(substance) {
//     const statsDiv = document.getElementById(`${substance}-stats`);
//     const button = document.querySelector(`#spiral-${substance}-controls button`);

//     if (statsDiv.style.display === "none") {
//         statsDiv.style.display = "block";
//         button.textContent = "Hide Stats";
//     } else {
//         statsDiv.style.display = "none";
//         button.textContent = "Show Stats";
//     }
// }

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

//         let totalAlcoholMale = 0, countAlcoholMale = 0, numAlcoholMale = 0;
//         let totalAlcoholFemale = 0, countAlcoholFemale = 0, numAlcoholFemale = 0;
//         let totalMJMale = 0, countMJMale = 0, numMJMale = 0;
//         let totalMJFemale = 0, countMJFemale = 0, numMJFemale = 0;

//         data.forEach(d => {
//             if (d.alcoholUse >= 1 && d.alcoholUse <= 30) {
//                 if (d.gender === 1) {
//                     maleAlcohol[d.alcoholUse]++;
//                     totalAlcoholMale += d.alcoholUse;
//                     countAlcoholMale++;
//                     numAlcoholMale++;
//                 } else {
//                     femaleAlcohol[d.alcoholUse]++;
//                     totalAlcoholFemale += d.alcoholUse;
//                     countAlcoholFemale++;
//                     numAlcoholFemale++;
//                 }
//             }
//             if (d.marijuanaUse >= 1 && d.marijuanaUse <= 30) {
//                 if (d.gender === 1) {
//                     maleMJ[d.marijuanaUse]++;
//                     totalMJMale += d.marijuanaUse;
//                     countMJMale++;
//                     numMJMale++;
//                 } else {
//                     femaleMJ[d.marijuanaUse]++;
//                     totalMJFemale += d.marijuanaUse;
//                     countMJFemale++;
//                     numMJFemale++;
//                 }
//             }
//         });

//         const avgAlcoholMale = (totalAlcoholMale / countAlcoholMale).toFixed(1);
//         const avgAlcoholFemale = (totalAlcoholFemale / countAlcoholFemale).toFixed(1);
//         const avgMJMale = (totalMJMale / countMJMale).toFixed(1);
//         const avgMJFemale = (totalMJFemale / countMJFemale).toFixed(1);

//         const alcoholStats = `
//             <strong>Average Alcohol Use:</strong><br>
//             Male: ${avgAlcoholMale} days<br>
//             Female: ${avgAlcoholFemale} days<br><br>
//             <strong>Men Who Drank:</strong> ${countAlcoholMale} of ${totalMales}<br>
//             <strong>Women Who Drank:</strong> ${countAlcoholFemale} of ${totalFemales}
//         `;

//         const mjStats = `
//             <strong>Average Marijuana Use:</strong><br>
//             Male: ${avgMJMale} days<br>
//             Female: ${avgMJFemale} days<br><br>
//             <strong>Men Who Used:</strong> ${countMJMale} of ${totalMales}<br>
//             <strong>Women Who Used:</strong> ${countMJFemale} of ${totalFemales}
//         `;

//         d3.select('#alcohol-stats').html(alcoholStats);
//         d3.select('#mj-stats').html(mjStats);

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

//         d3.tsv("data/male_vs_female_arrest.tsv").then(drawGenderArrestComparison);
//     });
// }

// window.addEventListener('load', init);

