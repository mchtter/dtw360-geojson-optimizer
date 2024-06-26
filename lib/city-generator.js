document.getElementById("submit").addEventListener("click", () => {
  try {
    input = document.getElementById("input").value;
    geojson = JSON.parse(JSON.stringify(JSON.parse(input)));
  } catch (error) {
    alert("Please enter a valid GeoJSON data.");
    return;
  }

  const parsedData = [];

  geojson.features.forEach((feature) => {
    if (feature.geometry.type == "MultiPolygon") {
      parsedData.push({
        Name: feature.properties.SHAPE__ID,
        type: feature.geometry.type,
        height: feature.properties.height == 0 ? 5 : feature.properties.height,
        coordinates: feature.geometry.coordinates[0][0].map((coordinate) => {
          const [X, Y] = coordinate;
          return `(X=${X},Y=${Y})`;
        }),
      });
    }

    if (feature.geometry.type == "Polygon") {
      parsedData.push({
        Name: feature.properties.SHAPE__ID,
        type: feature.geometry.type,
        height: feature.properties.height == 0 ? 5 : feature.properties.height,
        coordinates: feature.geometry.coordinates[0].map((coordinate) => {
          const [X, Y] = coordinate;
          return `(X=${X},Y=${Y})`;
        }),
      });
    }
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
  //   var dataArray = JSON.parse(data);
  var zip = new JSZip();
  //   var count = 1;
  zip.file(`${geojson.name || "city_generation_data"}.json`, data);
  zip.generateAsync({ type: "blob" }).then(function (content) {
    saveAs(content, `${geojson.name || "city_generation_data"}_parsed.zip`);
  });
});
