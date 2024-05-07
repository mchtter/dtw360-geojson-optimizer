const replaceTurkishChar = (str) => {
    return str
      .replace(/ğ/g, "g")
      .replace(/Ğ/g, "G")
      .replace(/ü/g, "u")
      .replace(/Ü/g, "U")
      .replace(/ş/g, "s")
      .replace(/Ş/g, "S")
      .replace(/ı/g, "i")
      .replace(/İ/g, "I")
      .replace(/ö/g, "o")
      .replace(/Ö/g, "O")
      .replace(/ç/g, "c")
      .replace(/Ç/g, "C");
  };

  document.getElementById("submit").addEventListener("click", () => {
    try {
        var input = document.getElementById("input").value;
        var geojson = JSON.parse(replaceTurkishChar(JSON.stringify(JSON.parse(input))));
    } catch (error) {
        alert("Please enter a valid GeoJSON data.");
        return;
    }

    var includeProperties =
      document.getElementById("includeProperties").checked;
    var chunkedDataSizes = document.getElementById("chunkedDataSizes");
    var firstSize = document.getElementById("firstSize");
    var output = document.getElementById("output");
    
    var chunked = [];
    var chunkSize = 0;
    var maxChunkSize = 127000;

    var optimized = {
      type: "FeatureCollection",
      features: [],
    };

    var chunk = {
      type: "FeatureCollection",
      features: [],
    };

    geojson.features.forEach((feature) => {
      var optimizedFeature = {
        type: "Feature",
        geometry: {
          type: feature.geometry.type,
          coordinates: feature.geometry.coordinates,
        },
      };
      if (includeProperties) {
        optimizedFeature["properties"] = feature.properties;
      }
      optimized.features.push(optimizedFeature);
    });

    optimized.features.forEach((feature) => {
      var featureSize = JSON.stringify(feature).length;
      if (chunkSize + featureSize > maxChunkSize) {
        chunked.push(chunk);
        chunk = {
          type: "FeatureCollection",
          features: [],
        };
        chunkSize = 0;
      }
      chunk.features.push(feature);
      chunkSize += featureSize;
    });
    chunked.push(chunk);

    chunkedDataSizes.innerHTML = "";
    firstSize.innerHTML = "";
    lastSize.innerHTML = "";

    chunked.forEach((chunk, index) => {
      var chunkSize = JSON.stringify(chunk).length;
      chunkedDataSizes.innerHTML += `<li>Chunk ${index + 1}: ${chunkSize} bytes</li>`;
    });

    firstSize.innerHTML = `First data size: ${JSON.stringify(geojson).length} bytes`;
    lastSize.innerHTML = `Last data size: ${JSON.stringify(chunked).length} bytes`;

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