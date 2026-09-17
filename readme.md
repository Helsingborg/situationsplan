<div align="center">
    <div style="width: 418px !important; height: 177px !important;">
        <img src="logo.jpg" alt="Helsingborg stad">
    </div>
</div>

# Situationsplan
Kartunderlag för situationsplan - en enkel tomtkarta för ArcGIS/Geosecma. Byggt med ArcGIS API for JS 3.25

## Features
* Adress/Fastighetssök
* Slimmat interface - endast skala/format.
* Panorera kartan i det markerade utskriftsområdet
* Skriv ut sökresultatet i PDF.
* Visa utskriftsområde eller inte.
* Utskriftsinställningar.

## Installation
* Klona eller ladda ner det här "Repository".
* Kopiera **config.example.js** till **config.js** och ändra den efter alla länkvärdena från din server eller miljö.

## Tjänster som behövs
* En BaseMaptjänst för kartan.
* En FeatureServertjänst för adressök
* En FeatureServertjänst för fastighetssök

> [!WARNING] 
> ***Om URL till dessa tjänster ändras, kom ihåg att uppdatera config.js***

>[!IMPORTANT]
>Justera koordinaterna i filen config.js för det område som ska visas som standardvy på kartan.

>[!NOTE]
>T.ex.: Helsingborg - extent.
#### Måste vara (WGS84)
        extends: {
            xmin: 12.65,
            ymin: 56.03,
            xmax: 12.75,
            ymax: 56.08,
            spatialReference: {
                wkid: 4326,
            },
        },

## Konfigurera mallar
### ArcGIS Pro – utskriftsmall.
* Skapa mallarna (A3, A4 i .pagx-format) och spara dem på en lämplig plats där du samlar din GIS-dokumentation och/eller dina arbetsrutiner.

> [!NOTE]
> Om mallarna behöver ändras måste PrintingServicen publiceras om. Följ dessa steg:
* Hitta Kart och Mäts mallar: \\SERVERADRESS\GIS\ArcGis\GEOSECMA\Mallar
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
ArcGIS Maps SDK for JavaScript [ESRI - Developer](https://developers.arcgis.com/javascript/3/jsapi/printtask-amd.html).

## TODO: