document.getElementById("submit").addEventListener("click", () => {
  try {
    input = document.getElementById("input").value;
    geojson = JSON.parse(JSON.stringify(JSON.parse(input)));
  } catch (error) {
    alert("Please enter a valid GeoJSON data.");
    return;
  }

  const parsedData = [];

  geojson.features.forEach((feature, index) => {
    if (feature.properties.Yukseklik1 == null) return;

    parsedData.push({
      Name: index,
      ID: index,
      type: "Surface",
      surfaceID: feature.properties.fid,

      height: feature.properties.Yukseklik1,
      rowIndex: feature.properties.row_index,
      colIndex: feature.properties.col_index,
      coordinate: `(X=${feature.geometry.coordinates[0].toFixed(
        6
      )},Y=${feature.geometry.coordinates[1].toFixed(6)})`,
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
  zip.file(`${geojson.name || "surface_generation_data"}.json`, data);
  zip.generateAsync({ type: "blob" }).then(function (content) {
    saveAs(content, `${geojson.name || "surface_generation_data"}_parsed.zip`);
  });
});
