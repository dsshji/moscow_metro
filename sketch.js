let table;
let myFont;
let metroLines = {}; //dictionary with lineName as key and stations as values
let nodes = [];

// animation variables
let progress = 0;     
let speed = 0.005; //line growth speed
let show_names = false; // choose to display names or not

function preload() {
  // 'ssv' splits by semicolons
  table = loadTable('data.csv', 'ssv', 'header');
  myFont = loadFont('NotoSans-VariableFont_wdth,wght.ttf'); 
}

function setup() {
  createCanvas(1200, 800);
  textFont(myFont);
  textAlign(CENTER, CENTER);
  resetData();
  
  //for verification
  console.log(`Loaded ${table.getRowCount()} rows.`);

  //create nodes based on loaded data
  for (let i = 1; i < table.getRowCount(); i++) {
    let rawStation = table.getString(i, 'Station');
    let rawLine = table.getString(i, 'Line');

    //clean data
    let station = cleanCell(rawStation);
    let lineName = cleanCell(rawLine);

    if (!station || !lineName) continue;
    
    let newNode = new Node(station, lineName);
    nodes.push(newNode);

    //group by line
    if (!metroLines[lineName]) {
      metroLines[lineName] = [];
    }
    // add this station to its line's list
    metroLines[lineName].push(newNode);
  }
}

function draw() {
  background(20);

  // update animation
  if (progress < 1) {
    progress += speed; 
  }

  // loop over every line in the dictionary
  for (let lineName in metroLines) {
    let stationsOnThisLine = metroLines[lineName];
    
    // get the color for this specific line
    let lineColor = getLineColor(lineName);
    stroke(lineColor);
    strokeWeight(2);

    // connect Station[j] to Station[j+1]
    for (let j = 0; j < stationsOnThisLine.length - 1; j++) {
      let startNode = stationsOnThisLine[j];
      let endNode = stationsOnThisLine[j+1];

      //calculate lerp
      let currentX = lerp(startNode.x, endNode.x, progress);
      let currentY = lerp(startNode.y, endNode.y, progress);

      // draw the line from the start to the current point
      line(startNode.x, startNode.y, currentX, currentY);
    }
  }

  // draw dots on top
  for (let i = 0; i < nodes.length; i++) {
    nodes[i].draw_node();
  }
}
class Node {
  constructor(station, lineName) {
    //assign random positions within the canvas
    this.x = random(50, width - 50);
    this.y = random(50, height - 50);
    this.station = station;
    this.lineName = lineName;
  }

  draw_node() {
    noStroke();
    
    // draw the dot
    fill(getLineColor(this.lineName));
    ellipse(this.x, this.y, 8, 8);
    
    //  draw station name if enabled
    if (show_names) {
      fill(255);
      textSize(10);
      text(this.station, this.x, this.y + 8); //enable an offset to not overlap text with a node
    }
  }
}

//start over if the mouse is pressed
function mousePressed() {
  resetData();
}

function resetData() {
  //reset global variables
  nodes = [];
  metroLines = {};
  progress = 0;
  
  // repopulate the canvas with nodes
  for (let i = 1; i < table.getRowCount(); i++) {
    let rawStation = table.getString(i, 'Station');
    let rawLine = table.getString(i, 'Line');

    let station = cleanCell(rawStation);
    let lineName = cleanCell(rawLine);

    if (!station || !lineName) continue;
    
    let newNode = new Node(station, lineName);
    nodes.push(newNode);

    // group by line
    if (!metroLines[lineName]) {
      metroLines[lineName] = [];
    }
    metroLines[lineName].push(newNode);
  }
}

//clear the data from garbage that prevents from proper extraction of data
function cleanCell(dirtyData) {
  if (!dirtyData) return "";
  let str = String(dirtyData);
  let match = str.match(/value=(.*?)\}/); //The Regex from GEMINI: see if there's repeated character up to the curly braces
  if (match && match[1]) return match[1]; //return actual data from regex
  return str.replace(/^"|"$/g, '').trim(); //replace the quotations from the beggining and the end of the line and clear up additional spaces
}

//official colors for all lines of the metro:
function getLineColor(lineName) {
  if (lineName.includes("Сокольническая")) return color(239, 22, 30);
  if (lineName.includes("Замоскворецкая")) return color(45, 190, 44);
  if (lineName.includes("Арбатско-Покровская")) return color(0, 120, 191);
  if (lineName.includes("Филёвская")) return color(25, 193, 243);
  if (lineName.includes("Кольцевая") && !lineName.includes("Большая")) return color(141, 91, 45);
  if (lineName.includes("Калужско-Рижская")) return color(237, 145, 33);
  if (lineName.includes("Таганско-Краснопресненская")) return color(128, 0, 128);
  if (lineName.includes("Калининская") || lineName.includes("Солнцевская")) return color(255, 203, 49);
  if (lineName.includes("Серпуховско-Тимирязевская")) return color(161, 162, 163);
  if (lineName.includes("Люблинско-Дмитровская")) return color(179, 212, 69);
  if (lineName.includes("Большая кольцевая")) return color(130, 205, 205);
  if (lineName.includes("Бутовская")) return color(172, 191, 233);
  if (lineName.includes("Монорельс")) return color(44, 117, 196);
  if (lineName.includes("МЦК") || lineName.includes("Московское центральное")) return color(231, 66, 65);
  if (lineName.includes("Некрасовская")) return color(222, 100, 161);
  if (lineName.includes("Троицкая")) return color(60, 144, 114);
  if (lineName.includes("МЦД-1") || lineName.includes("D1")) return color(246, 166, 0);
  if (lineName.includes("МЦД-2") || lineName.includes("D2")) return color(231, 66, 128);
  if (lineName.includes("МЦД-3") || lineName.includes("D3")) return color(233, 91, 12);
  if (lineName.includes("МЦД-4") || lineName.includes("D4")) return color(64, 178, 128);
  return color(255);
}