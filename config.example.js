define(function(){
    return {
        baseMap: "[här går din https://... arcgis rest service till MapServer länk]",
        adressFeatureServer: "[här går din https://... arcgis rest service till FeatureServer/0 länk]",
        fastighetFeatureServer: "[här går din https://... arcgis rest service till FeatureServer/0 länk]",

        // Helsingborg approx extent 
        // Must be (WGS84)
        extent: {
            xmin: 12.65,
            ymin: 56.03,
            xmax: 12.75,
            ymax: 56.08,
            spatialReference: {
                wkid: 4326,
            },
        },

        // Layout dataframe width/height
        paperSpace: {
            A4: {
                width: 0.190007,
                height: 0.202946
            },
            A3: {
                width: 0.2687578,
                height: 0.3044507
            }
        }
    };
});