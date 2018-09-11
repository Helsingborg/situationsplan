# Situationsplan
Kartunderlag för situationsplan - en enkel tomtkarta för ArcGIS/Geosecma. Byggt med ArcGIS API for JS 3.25

## Features
* Adress/Fastighetssök
* Slimmat interface - endast skala/format

## Installation
* Klona eller ladda ner det här repot.
* Editera config.js efter din miljö

## Tjänster som behövs
* En FeatureServertjänst för adressök
* En FeatureServertjänst för fastighetssök
* En MapServer tjänst för innehållet i kartan
* En custom PrintingService

> Om URL till dessa tjänster ändras, kom ihåg att uppdatera config.js

## Konfigurera mallar
Om mallarna behöver ändras måste PrintingServicen publiceras om. Följ dessa steg:
* Hitta Kart och Mäts mallar: \\R002345\VGIplatsen\ArcGis\GEOSECMA\Mallar
* Hitta Situationsplansmall för stående A4/A3.
* Kopiera dem till en egen mapp tex C:/temp/templates
* Döp om mallarna till A4/A3 om de har längre namn.
* Kör verktyget Server Tools/Printing/Export Web Map
* Välj format PDF och Mapp för layoutmallar till C:/temp/templates eller motsvarande
* Välj en default mall (A4)
* Kör verktyget
* När det är färdigt, öppna resultatfönstret och högerklicka på jobbet.
* Välj dela som geoprocessingtjänst (utskriftsTjänst?)
* Konfigurera tvingande PDF
* Acceptera uppladning av C:/temp/templates
* Klart

> Tänk på att tjänsten förhandsvy är beroende på att kartans utbredning anges korrekt i config.js

## Nyttiga länkar
* https://developers.arcgis.com/javascript/3/jsapi/printtask-amd.html

## TODO
* Ta bort testtjänster
* Visa mer exakt streckad förhandsyta
* Flytta kartutbredningskonstanterna till config.js 
* Lägg till cachad bakgrundskarta (funkar inte att zooma ut till 5000+ nu)