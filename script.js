"use strict";

const population = document.querySelector(".slider#population");
const initialCap = document.querySelector(".slider#initialCap");
const skill = document.querySelector(".slider#skill");
const body = document.querySelector("body");
const simulator = document.querySelector(".simulator");
const person = document.querySelector("img");
const sliders = document.querySelectorAll(".slider");
const total = document.querySelector("#total");
const run = document.querySelector(".run");
const ticksCount = document.querySelector(".ticks");
const selector = document.querySelector("select");
const safeInput = document.querySelector("#safeZone");
const safeLine = document.querySelector(".safeLine");

let selected = "wealth";
selector.addEventListener("change", () => {
    if (selector.value === "wealth") {
        selected = "wealth";
    } else {
        selected = "energy";
    }
});


class Person {
    constructor(id) {
        this.identity = id;
        this.wealth = parseFloat(initialCap.value);
        this.scale = 1;
        this.skill = skill.value;
        this.position = 0;
        const person = document.createElement("div");
        person.classList.add("person");
        person.innerHTML = `<p class="skillLevel"></p><img src="person.svg" alt="" class="unit" id="${id}"><p class="val"></p>`
        this.element = person;
        simulator.appendChild(person);
        // person.addEventListener("click", () => {
        //     console.log(this);
        //     console.log(this.element);
        //     console.log(this.scale);
        // });
    }
}

function evaluateDistribution() {
    const topShare = document.querySelector("#topShare");
    const bottomShare = document.querySelector("#bottomShare");
    const peopleOrdered = [...people];
    peopleOrdered.sort((obj1, obj2) => obj2.wealth - obj1.wealth);
    let men = 0;
    let sum = 0;
    while (men < (peopleOrdered.length / 10)) {
        sum += parseFloat(peopleOrdered[men].wealth);
        men++;
    }
    let topSh = (parseFloat(sum / (parseFloat(population.value) * parseFloat(initialCap.value))) * 100).toFixed(2);
    let bottomSh = parseFloat(100 - topSh).toFixed(2);
    topShare.value = `${topSh}%`;
    bottomShare.value = `${bottomSh}%`;
}

function reevaluate() {
    const units = document.getElementsByTagName("img");
    for (let i = 0; i < units.length; i++) {
        units[i].nextElementSibling.textContent = parseFloat(people[i].wealth).toFixed(1);
        units[i].previousElementSibling.textContent = parseFloat(people[i].skill).toFixed(2);
        units[i].parentElement.style.transform = `scale(${parseFloat(people[i].scale)})`;
    }
    evaluateDistribution();
}

sliders.forEach((slider) => {
    slider.nextElementSibling.textContent = slider.value;
    slider.addEventListener("input", () => {
        slider.nextElementSibling.textContent = slider.value;
        total.value = population.value * initialCap.value;
    })
})

let people = [];
population.addEventListener("input", () => {
    const units = document.getElementsByClassName("unit");
    const vals = document.getElementsByClassName("val");
    const skillLevels = document.getElementsByClassName("skillLevel");
    simulator.innerHTML = "";
    people = [];
    for (let i = 0; i < population.value; i++) {
        let man = new Person(i + 1);
        people.push(man);
    }
    simulator.append(safeLine);
    reevaluate();

    const map1 = new Map();
    map1.set(25, ["40px", "1rem"]);
    map1.set(37, ["30px", "0.75rem"]);
    map1.set(55, ["20px", "0.5rem"]);
    map1.set(75, ["15px", "0.3rem"]);
    map1.set(100, ["11px", "0.25rem"]);
    for (let [key, value] of map1) {
        if (population.value <= key) {
            for (let i = 0; i < units.length; i++) {
                units[i].style.height = value[0];
                units[i].style.width = value[0];
            }
            for (let i = 0; i < vals.length; i++) {
                vals[i].style.fontSize = value[1];
                skillLevels[i].style.fontSize = value[1];
            }
            return;
        }
    }
})

skill.addEventListener("input", () => {
    let k = 0;
    const increment = (parseFloat(skill.value) - 1) / (parseInt(population.value) - 1);
    const skillArray = [];
    people.forEach(() => {
        skillArray.push(parseFloat(1 + (increment * k)).toFixed(2));
        k++;
    })
    people.forEach((peopleUnit) => {
        let elemIndex = Math.floor(Math.random() * skillArray.length);
        peopleUnit.skill = parseFloat(skillArray[elemIndex]);
        skillArray.splice(elemIndex, 1);
    })
    reevaluate();
})

initialCap.addEventListener("input", () => {
    people.forEach((peopleUnit) => {
        peopleUnit.wealth = parseFloat(initialCap.value);
    })
    reevaluate();
})

safeInput.addEventListener("input", () => {
    safeLine.style.display = "block";
    safeLine.style.bottom = `${safeInput.value}%`;
})


function transact(i) {
    const customers = document.querySelector("#customers").value;
    let customerIndices = [];
    let j = 0;
    while (j < customers) {
        const rand = Math.floor(Math.random() * people.length);
        if (rand !== i && !customerIndices.includes(rand)) {
            customerIndices.push(rand);
            j++;
        }
    }
    if (customerIndices.length) {
        if (people[i].element.getBoundingClientRect().top >= 20) {
            people[i].position += parseFloat(people[i].skill);
            people[i].element.style.bottom = `${parseFloat(people[i].position) * (5)}px`;
        }
        people[i].wealth += parseFloat(people[i].skill);
        if (people[i].position >= 30) {
            people[i].scale = parseFloat(people[i].scale) + 0.00125;
        }
    }
    customerIndices.forEach((customerIndex) => {
        if (safeLine.getBoundingClientRect().bottom - people[customerIndex].element.getBoundingClientRect().bottom >= 5) {
            people[customerIndex].position -= (parseFloat(people[i].skill) / customers);
            people[customerIndex].element.style.bottom = `${parseFloat(people[customerIndex].position) * (5)}px`;
            people[customerIndex].wealth -= (parseFloat(people[i].skill) / customers);
        } else {
            const peopleOrdered = [...people];
            peopleOrdered.sort((obj1, obj2) => obj2.wealth - obj1.wealth);
            const rich = parseInt(peopleOrdered.length * 0.25);
            peopleOrdered.slice(0, rich).forEach((richMan) => {
                richMan.wealth -= (parseFloat(people[i].skill) / customers) / rich;
                richMan.position -= (parseFloat(people[i].skill) / customers) / rich;
            });
        }
    })
    reevaluate();
}

function tick(k) {
    for (let m = 0; m < k; m++) {
        for (let i = 0; i < people.length; i++) {
            transact(i);
        }
    }
    const ticks = parseInt(ticksCount.textContent);
    ticksCount.textContent = ticks + k;
}

run.addEventListener("click", () => {
    let ticked = 0;
    const intID = setInterval(() => {
        tick(1);
        ticked++;
        if (ticked === 500) {
            clearInterval(intID);
        }
    }, 2);
    evaluateDistribution();
})