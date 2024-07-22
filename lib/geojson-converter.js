function MultiPolygonToPolygon(geojson) {
  let features = geojson.features;
  let newFeatures = [];
  features.forEach(function (feature) {
    let geometry = feature.geometry;
    feature.geometry.type = "Polygon";
    let coordinates = geometry.coordinates;
    let newCoordinates = [];
    coordinates.forEach(function (polygon) {
      newCoordinates.push(polygon[0]);
    });
    feature.geometry.coordinates = newCoordinates;
    newFeatures.push(feature);
  });
  return { type: "FeatureCollection", features: newFeatures };
}

function PolygonToMultiPolygon(geojson) {
  let features = geojson.features;
  let newFeatures = [];
  features.forEach(function (feature) {
    let geometry = feature.geometry;
    feature.geometry.type = "MultiPolygon";
    let coordinates = geometry.coordinates;
    let newCoordinates = [];
    coordinates.forEach(function (polygon) {
      newCoordinates.push([polygon]);
    });
    feature.geometry.coordinates = newCoordinates;
    newFeatures.push(feature);
  });
  return { type: "FeatureCollection", features: newFeatures };
}

function MultiLineStringToLineString(geojson) {
  let features = geojson.features;
  let newFeatures = [];
  features.forEach(function (feature) {
    let geometry = feature.geometry;
    feature.geometry.type = "LineString";
    let coordinates = geometry.coordinates;
    let newCoordinates = [];
    coordinates.forEach(function (lineString) {
      newCoordinates.push(lineString[0]);
    });
    feature.geometry.coordinates = newCoordinates;
    newFeatures.push(feature);
  });
  return { type: "FeatureCollection", features: newFeatures };
}

function LineStringToMultiLineString(geojson) {
  let features = geojson.features;
  let newFeatures = [];
  features.forEach(function (feature) {
    let geometry = feature.geometry;
    feature.geometry.type = "MultiLineString";
    let coordinates = geometry.coordinates;
    let newCoordinates = [];
    coordinates.forEach(function (lineString) {
      newCoordinates.push([lineString]);
    });
    feature.geometry.coordinates = newCoordinates;
    newFeatures.push(feature);
  });
  return { type: "FeatureCollection", features: newFeatures };
}

function PolygonToLineString(geojson) {
  let features = geojson.features;
  let newFeatures = [];
  features.forEach(function (feature) {
    let geometry = feature.geometry;
    feature.geometry.type = "LineString";
    let coordinates = geometry.coordinates;
    let newCoordinates = [];
    coordinates.forEach(function (polygon) {
      newCoordinates.push(polygon[0]);
    });
    feature.geometry.coordinates = newCoordinates;
    newFeatures.push(feature);
  });
  return { type: "FeatureCollection", features: newFeatures };
}

var geojson = null;
var inputFile = null;
var geometryType = null;
var output = document.getElementById("output");

(function () {
  function onChange(event) {
    var reader = new FileReader();
    reader.onload = onReaderLoad;
    reader.readAsText(event.target.files[0]);
  }

  function onReaderLoad(event) {
    geojson = JSON.parse(event.target.result);
  }

  document.getElementById("file").addEventListener("change", onChange);
})();

document.getElementById("submit").addEventListener("click", async () => {
  const selectedOption = document.getElementsByName("geometryType");

  try {
    selectedOption.forEach((option) => {
      if (option.checked) {
        geometryType = option.value;
      }
    });
    if (geometryType == null) {
      throw new Error("Please select a geometry type.");
    }
  } catch (error) {
    alert("Please select a geometry type.");
    return;
  }

  let convertedData = {};

  if (geometryType == "multipolygon-to-polygon") {
    convertedData = MultiPolygonToPolygon(geojson);
  } else if (geometryType == "polygon-to-line") {
    convertedData = PolygonToLineString(geojson);
  } else if (geometryType == "multiline-to-line") {
    convertedData = MultiLineStringToLineString(geojson);
  }

  output.value = JSON.stringify(convertedData);
});

document.getElementById("copy").addEventListener("click", () => {
  var output = document.getElementById("output");
  output.select();
  document.execCommand("copy");
});

document.getElementById("clear").addEventListener("click", () => {
  document.getElementById("file").value = "";
  document.getElementById("output").value = "";
});

document.getElementById("download").addEventListener("click", () => {
  function saveAs(blob, name) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }

  var data = document.getElementById("output").value;
  var zip = new JSZip();
  zip.file(`${geojson.name || "city_generation_geojson"}.json`, data);
  zip.generateAsync({ type: "blob" }).then(function (content) {
    saveAs(content, `${geojson.name || "city_generation_geojson"}_coverted.zip`);
  });
});
