var input = null;
var geojson = null;
var includeProperties = null;
var chunkedDataSizes = null;
var firstSize = null;
var output = null;

const replaceNonstandardChars = (str) => {
  const charMap = {
    "ğ": "g", "Ğ": "G",
    "ı": "i", "İ": "I",
    "ş": "s", "Ş": "S",
    "ç": "c", "Ç": "C",
    "á": "a", "Á": "A",
    "é": "e", "É": "E",
    "í": "i", "Í": "I",
    "ó": "o", "Ó": "O",
    "ú": "u", "Ú": "U",
    "ñ": "n", "Ñ": "N",
    "ä": "a", "Ä": "A",
    "ë": "e", "Ë": "E",
    "ï": "i", "Ï": "I",
    "ö": "o", "Ö": "O",
    "ü": "u", "Ü": "U",
    "à": "a", "À": "A",
    "è": "e", "È": "E",
    "ì": "i", "Ì": "I",
    "ò": "o", "Ò": "O",
    "ù": "u", "Ù": "U",
    "â": "a", "Â": "A",
    "ê": "e", "Ê": "E",
    "î": "i", "Î": "I",
    "ô": "o", "Ô": "O",
    "û": "u", "Û": "U",
    "ß": "ss",
  };

  return str
    .split("")
    .map(char => charMap[char] || char)
    .join("");
};

document.getElementById("submit").addEventListener("click", () => {
  try {
    input = document.getElementById("input").value;
    geojson = JSON.parse(
      replaceNonstandardChar(JSON.stringify(JSON.parse(input)))
    );
  } catch (error) {
    alert("Please enter a valid GeoJSON data.");
    return;
  }

  includeProperties = document.getElementById("includeProperties").checked;
  chunkedDataSizes = document.getElementById("chunkedDataSizes");
  firstSize = document.getElementById("firstSize");
  output = document.getElementById("output");

  var chunked = [];
  var chunkSize = 0;
  var maxChunkSize = 127000;

  var optimized = {
    feature: [],
  };

  var chunk = {
    feature: [],
  };

  geojson.features.forEach((feature) => {
    if (!feature.geometry || !feature.geometry.type) {
      alert("Geometry Type Not Found!");
      return;
    }

    var optimizedFeature = {
      type: "Feature",
      geometry: {
        type: feature.geometry.type,
        coordinates: optimizeCoordinatesByType(
          feature.geometry.coordinates,
          feature.geometry.type
        ),
      },
    };
    if (includeProperties) {
      optimizedFeature["properties"] = feature.properties;
    }
    optimized.feature.push(optimizedFeature);
  });

  optimized.feature.forEach((feature) => {
    var featureSize = JSON.stringify(feature).length;
    if (chunkSize + featureSize > maxChunkSize) {
      chunked.push(chunk);
      chunk = {
        type: "FeatureCollection",
        feature: [],
      };
      chunkSize = 0;
    }
    chunk.feature.push(feature);
    chunkSize += featureSize;
  });
  chunked.push(chunk);

  chunkedDataSizes.innerHTML = "";
  firstSize.innerHTML = "";
  lastSize.innerHTML = "";

  chunked.forEach((chunk, index) => {
    var chunkSize = JSON.stringify(chunk).length;
    chunkedDataSizes.innerHTML += `<li>Chunk ${
      index + 1
    }: ${chunkSize} bytes</li>`;
  });

  firstSize.innerHTML = `First data size: ${
    JSON.stringify(geojson).length
  } bytes`;
  lastSize.innerHTML = `Last data size: ${
    JSON.stringify(chunked).length
  } bytes`;

  output.value = JSON.stringify(chunked);
});

document.getElementById("copy").addEventListener("click", () => {
  var output = document.getElementById("output");
  output.select();
  document.execCommand("copy");
});

document.getElementById("clear").addEventListener("click", () => {
  document.getElementById("input").value = "";
  document.getElementById("output").value = "";
  document.getElementById("chunkedDataSizes").innerHTML = "";
  document.getElementById("firstSize").innerHTML = "";
  document.getElementById("lastSize").innerHTML = "";
});

function optimizeCoordinatesByType(coordinates, type) {
  if (type === "MultiPolygon") {
      return coordinates.map((polygon) => {
        return polygon.map((lineString) => {
          return optimizeCoordinate(lineString, type);
        });
      });
  } else if (type === "Polygon") {
      return coordinates.map((lineString) => {
        return optimizeCoordinate(lineString, type);
      });
  } else if (type === "LineString") {
      return optimizeCoordinate(coordinates, type);
  } else if (type === "MultiLineString") {
      return coordinates.map((lineString) => {
        return optimizeCoordinate(lineString);
      });
  } else if (type === "Point") {
      return optimizeCoordinate(coordinates, type);
  }
}

function optimizeCoordinate(lineString, type) {
  if (type === "Point") {
    return [
      Math.round(lineString[0] * 1e6) / 1e6,
      Math.round(lineString[1] * 1e6) / 1e6,
    ];
  } else {
    return lineString.map((points) => {
      return [
        Math.round(points[0] * 1e6) / 1e6,
        Math.round(points[1] * 1e6) / 1e6,
      ];
    });
  }
}

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
  var dataArray = JSON.parse(data);
  var zip = new JSZip();
  var count = 1;
  dataArray.forEach((data) => {
    zip.file(`${geojson.name || 'unnamed_geojson'}_${count}.json`, JSON.stringify([{...data}]));
    count++;
  });
  zip.generateAsync({ type: "blob" }).then(function (content) {
    saveAs(content, `${geojson.name || 'unnamed_geojson'}_chunked.zip`);
  });
});

