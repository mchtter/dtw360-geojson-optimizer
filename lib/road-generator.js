document.getElementById("submit").addEventListener("click", () => {
  try {
    input = document.getElementById("input").value;
    geojson = JSON.parse(JSON.stringify(JSON.parse(input)));
  } catch (error) {
    alert("Please enter a valid GeoJSON data.");
    return;
  }

  const parsedData = [];

  const allNames = new Set();

  geojson.features.forEach((feature, index) => {
    if (feature.properties.ID == null) return;
    allNames.add(feature.properties.Name);
  });

  const nameArray = [];

  allNames.forEach((name) => {
    nameArray.push(name);
  });

  const calculateLaneAmount = (input) => {
    if (typeof input === 'string') {
      const regex = /^\(X=(\d+),Y=(\d+)\)$/;
      const match = input.match(regex);
      if (match) {
        const x = parseInt(match[1], 10);
        const y = parseInt(match[2], 10);
        return x + y;
      }
    }
    if (typeof input === 'number') {
      return input;
    }
    return null;
  };

  geojson.features.forEach((feature, index) => {
    parsedData.push({
      Name: feature.properties.Name,
      ID: feature.properties.ID,
      type: feature.properties.type,
      roadID: feature.properties.ID,

      laneAmount: calculateLaneAmount(feature.properties.laneAmount),
      width:
        feature.properties.width == 0 || feature.properties.width == null
          ? 1
          : feature.properties.width,
      coordinates: feature.geometry.coordinates.flat(feature.geometry.type == 'MultiLineString' ? 1 : 1).map((coordinate) => {
        const [X, Y] = coordinate.map(Number);
        return `(X=${X.toFixed(6)},Y=${Y.toFixed(6)})`;
      }),
    });
  });

  output.value = JSON.stringify(parsedData);
});

document.getElementById("copy").addEventListener("click", () => {
  var output = document.getElementById("output");
  output.select();
  document.execCommand("copy");
});

document.getElementById("clear").addEventListener("click", () => {
  document.getElementById("input").value = "";
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
  zip.file(`${geojson.name || "road_generation_data"}.json`, data);
  zip.generateAsync({ type: "blob" }).then(function (content) {
    saveAs(content, `${geojson.name || "road_generation_data"}_parsed.zip`);
  });
});
