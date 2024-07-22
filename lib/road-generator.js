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
    if (feature.properties.name == null) return;
    allNames.add(feature.properties.name);
  });

  const nameArray = [];

  allNames.forEach((name) => {
    if (name == null || name == -1) return;
    nameArray.push(name);
  });

  geojson.features.forEach((feature, index) => {
    parsedData.push({
      Name: index,
      ID: index,
      type: "Road",
      roadID: nameArray.indexOf(`${feature.properties.name}`),

      laneAmount: 1,
      width:
        feature.properties.width == 0 || feature.properties.width == null
          ? 1
          : feature.properties.width,
      coordinates: feature.geometry.coordinates.map((coordinate) => {
        const [X, Y] = coordinate;
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
  //   var dataArray = JSON.parse(data);
  var zip = new JSZip();
  //   var count = 1;
  zip.file(`${geojson.name || "road_generation_data"}.json`, data);
  zip.generateAsync({ type: "blob" }).then(function (content) {
    saveAs(content, `${geojson.name || "road_generation_data"}_parsed.zip`);
  });
});
