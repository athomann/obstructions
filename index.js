var ExifImage = require("exif").ExifImage;
var fs = require("fs");
var path = require("path");
var dms = require("dms-conversion");
// var obstructions = require("./obstructions.json");

// console.log(obstructions.length);

const obstructions = [];

function init() {
  readImages();
}

function readImages() {
  return fs.readdir("./images", (err, files) => {
    if (err) {
      throw Error("Error" + err);
    }

    files.forEach((image, i) => {
      getExifData(image);
    });
  });
}

function getExifData(image) {
  try {
    new ExifImage({ image: path.join(__dirname, `/images/${image}`) }, function(
      error,
      exifData
    ) {
      if (error) {
        console.log(`Error ${image}:` + error.message);
      } else {
        if (exifData.gps.GPSLongitude) {
          const [d, m, s] = exifData.gps.GPSLongitude;
          const longitude = dms.parseDms(
            `${d}°${m}'${s}" ${
              exifData.gps.GPSLongitudeRef
            }`
          );


          const [de, me, se] = exifData.gps.GPSLatitude;
          const latitude = dms.parseDms(
            `${de}°${me}'${se}" ${
              exifData.gps.GPSLatitudeRef
            }`
          );

          const data = {
            geostring: `${latitude},${longitude}`,
            image,
            date: exifData.exif.DateTimeOriginal
          };

          obstructions.push(data);
          const sortedObs = [...obstructions].sort((a, b) => {
            if (a.image > b.image) return 1;
            if (b.image > a.image) return -1;
            return 0;
          });

          createJsonFile(sortedObs);
        }
      }
    });
  } catch (error) {
    console.log("Error: " + error.message);
  }
}

function createJsonFile(data) {
  fs.writeFile("obstructions.json", JSON.stringify(data), "utf8", () =>
    console.log("finished")
  );
}

init();
