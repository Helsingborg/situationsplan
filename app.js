// --------------------------------------------------
// MAIN IMPORT - ARCGIS WEB COMPONENTS -
// This will load the ArcGIS API for JavaScript v5 and the web components
// --------------------------------------------------
// import "https://js.arcgis.com/5.0/map-components/";
// --------------------------------------------------

console.log("App.js loaded", $arcgis);

const [ Map, MapImageLayer ] = await Promise.all([
  $arcgis.import("@arcgis/core/Map.js"),
  $arcgis.import("@arcgis/core/layers/MapImageLayer.js"),
]);

const [
  print,
  Basemap,
  SpatialReference,
  Polygon,
  SimpleFillSymbol,
  Graphic,
  GraphicsLayer,
  Extent,
  TextContent,
  ActionButton,
  esriConfig,
] = await Promise.all([
  $arcgis.import("@arcgis/core/rest/print.js"),
  $arcgis.import("@arcgis/core/Basemap.js"),
  $arcgis.import("@arcgis/core/geometry/SpatialReference.js"),
  $arcgis.import("@arcgis/core/geometry/Polygon.js"),
  $arcgis.import("@arcgis/core/symbols/SimpleFillSymbol.js"),
  $arcgis.import("@arcgis/core/Graphic.js"),
  $arcgis.import("@arcgis/core/layers/GraphicsLayer.js"),
  $arcgis.import("@arcgis/core/geometry/Extent.js"),
  $arcgis.import("@arcgis/core/popup/content/TextContent.js"),
  $arcgis.import("@arcgis/core/support/actions/ActionButton.js"),
  $arcgis.import("@arcgis/core/config.js"),
]);

import Config from "./config.js";
import PrintDialog from "./PrintDialog.js";

let fastigheterPointGeoGraphic = null;
let formatPDF = null;
let pdfScale = null;
let printTitleTab = null;
let printExportButton = null;

function updatePrintExtent() {
  printBoundsLayer.removeAll();

  const poly = new Polygon({
    spatialReference: { wkid: 3008 },
  });

  const graphic = new Graphic({
    geometry: poly,
    symbol: new SimpleFillSymbol({
      style: "solid",
      color: [255, 255, 0, 0.01],
      outline: {
        color: [255, 0, 0],
        style: "dash",
        width: 2,
      },
    }),
  });
}

// create a basemap from a dynamic mapserver
const basemap = new Basemap({
  baseLayers: [
    new MapImageLayer({
      url: Config.baseMap,
      title: "Karta",
    }),
  ],
  title: "Basemap",
  id: "situationsplan-karta",
});

// Used to store searches, active property, jobs and more while the user navigates
window.state = {
  jobs: {},
};

const map = new Map({
  basemap: basemap,
  constraints: {
    rotationEnabled: false,
  },
});

const mapEl = document.querySelector("arcgis-map");

mapEl.map = map;

const printBoundsLayer = new GraphicsLayer();

mapEl.spatialReference = {
  wkid: 3008,
};

await mapEl.viewOnReady();

let view = mapEl.view;

const arcgisPrint = document.querySelector("arcgis-print");

await arcgisPrint.componentOnReady();

arcgisPrint.showPrintAreaEnabled = true;

// Hide the print widget until a search result is selected
document.querySelector("#print").style.display = "none";

function goToDefaultExtent(view) {
  // Helsingborg approx extent (WGS84)
  const extent = new Extent({
    xmin: Config.extent.xmin,
    ymin: Config.extent.ymin,
    xmax: Config.extent.xmax,
    ymax: Config.extent.ymax,
    spatialReference: {
      wkid: Config.extent.spatialReference.wkid,
    },
  });

  view
    .goTo(extent, {
      duration: 1000,
    })
    .catch((err) => {
      if (err.name !== "view:goto-interrupted") {
        console.error(err);
      }
    });
}


goToDefaultExtent(view);

view.when(() => {

  let downloadPDFBtn = new ActionButton({
    id: "download-pdf",
    title: "Ladda ner  PDF",
    icon: "print",
  });

  let searchPDFBtn = new ActionButton({
    id: "back-search",
    title: "Tillbaka till sökning",
    icon: "search",
  });

  let closePDFBtn = new ActionButton({
    id: "close-btn",
    title: "Skala & Format",
    icon: "map-level-settings",
  });

  const popupTemplateName = {
    title: "{Name}",
    overwriteActions: true, // Remove default actions
    actions: [downloadPDFBtn, searchPDFBtn, closePDFBtn],
  };

  let searchResult = null;

  let modalEsriPrint = document.getElementById("esri-print-modal");

  // Utskriftsinställningar button text change
  let utskriftsinstallningarBtn = null; 

  function handlePopupAction(event) {
    console.log("Popup action triggered:", event);

    fastigheterPointGeoGraphic = event.detail.result.feature.geometry;

    fastigheterPointGeoGraphic.destroy();

    switch (event?.detail?.result?.id) {
      case "download-pdf":
        window.submitPrintJob();
        break;
      case "back-search":
        destroyWidget();
        goToDefaultExtent();
        updatePrintExtent();
        break;
      case "close-btn":
        document.getElementById("esri-print-modal").open = false;
        break;
    }
  }

  mapEl.when(() => {
    mapEl.view.popup.on("trigger-action", handlePopupAction);
  });

  function openPrintDialog(searchResult) {
    // Titel
    document
      .querySelector("#print")
      .shadowRoot.querySelector(".root")
      .querySelector("calcite-flow")
      .querySelector("calcite-flow-item")
      .querySelector("div.container")
      .querySelector("arcgis-print-main-panel")
      .shadowRoot.querySelector("calcite-tabs")
      .querySelector("calcite-tab")
      .querySelector("arcgis-print-layout-panel")
      .shadowRoot.querySelector("section.layout-section")
      .querySelector("div.panel-container")
      .querySelector("calcite-label")
      .querySelector("calcite-input")
      .shadowRoot.querySelector("div.wrapper")
      .querySelector("div.element-wrapper")
      .querySelector("input").value = searchResult?.name;
    // ESRI Print
    document.querySelector("#print").hideAdvancedOptions = true;
    document.querySelector("#print").hideHeader = true;
    //File Format display none
    document
      .querySelector("#print")
      .shadowRoot.querySelector(".root")
      .querySelector("calcite-flow")
      .querySelector("calcite-flow-item")
      .querySelector("div.container")
      .querySelector("arcgis-print-main-panel")
      .shadowRoot.querySelector("calcite-tabs")
      .querySelector("calcite-tab")
      .querySelector("arcgis-print-layout-panel")
      .shadowRoot.querySelector("section.layout-section")
      .querySelector("div.panel-container")
      .querySelector("arcgis-print-format-select").style.display = "none";
    // Title change from Layout to "Skriv ut PDF"
    printTitleTab = document
      .querySelector("#print")
      .shadowRoot.querySelector(".root")
      .querySelector("calcite-flow")
      .querySelector("calcite-flow-item")
      .querySelector("div.container")
      .querySelector("arcgis-print-main-panel")
      .shadowRoot.querySelector("calcite-tabs")
      .querySelector("calcite-tab-nav")
      .querySelectorAll("calcite-tab-title")[0];
    printTitleTab.textContent = "Skriv ut PDF";
    // Title Endasd Map Only display none
    document
      .querySelector("#print")
      .shadowRoot.querySelector(".root")
      .querySelector("calcite-flow")
      .querySelector("calcite-flow-item")
      .querySelector("div.container")
      .querySelector("arcgis-print-main-panel")
      .shadowRoot.querySelector("calcite-tabs")
      .querySelector("calcite-tab-nav")
      .querySelectorAll("calcite-tab-title")[1].style.display = "none";
    // Title change from Layout to "Skriv ut PDF"
    document
      .querySelector("#print")
      .shadowRoot.querySelector(".root")
      .querySelector("calcite-flow")
      .querySelector("calcite-flow-item")
      .querySelector("div.container")
      .querySelector("arcgis-print-main-panel")
      .shadowRoot.querySelector("calcite-tabs")
      .querySelector("calcite-tab-nav")
      .querySelectorAll("calcite-tab-title")[2].textContent =
      "Dina exporterade PDF filer";
    // Skriv ut PDF button text change
    printExportButton = document
      .querySelector("#print")
      .shadowRoot.querySelector(".root")
      .querySelector("calcite-flow")
      .querySelector("calcite-flow-item")
      .querySelector("div.container")
      .querySelector("arcgis-print-main-panel")
      .shadowRoot.querySelector("calcite-tabs")
      .querySelector("calcite-tab")
      .querySelector("arcgis-print-layout-panel")
      .shadowRoot.querySelector("section.layout-section")
      .querySelector("arcgis-print-export-button")
      .shadowRoot.querySelector("div")
      .querySelector("calcite-button");
    printExportButton.textContent = "Skriv ut PDF";
    // Style overflow auto
    document
      .querySelector("#print")
      .shadowRoot.querySelector(".root")
      .querySelector("calcite-flow").style.overflow = "auto";
    // Utskriftsinställningar button text change
    utskriftsinstallningarBtn = document
      .querySelector("#print")
      .shadowRoot.querySelector(".root")
      .querySelector("calcite-flow")
      .querySelectorAll("calcite-flow-item")[1]
      .querySelector("arcgis-print-template-selector")
      .shadowRoot.querySelector("div.template-select-flow-item-container")
      .querySelector("div.template-button-container")
      .querySelector("calcite-button.template-done-button");
    utskriftsinstallningarBtn.textContent = "Utskriftsinställningar";
    utskriftsinstallningarBtn.addEventListener("click", () => {
      printTitleTab.click();
      document.getElementById("esri-print-modal").open = true;
    });

    printExportButton.addEventListener("click", () => {
      printBoundsLayer.removeAll();
      fastigheterPointGeoGraphic.destroy();
    });

    // Hide Header in Print Dialog
    document
      .querySelector("#print")
      .shadowRoot.querySelector(".root")
      .querySelector("calcite-flow")
      .querySelectorAll("calcite-flow-item")[1]
      .shadowRoot.querySelector("calcite-panel")
      .shadowRoot.querySelector("article.container")
      .querySelector("header.header").style.display = "none";
    // Hide Page Setup in Print Dialog
    document
      .querySelector("#print")
      .shadowRoot.querySelector(".root")
      .querySelector("calcite-flow")
      .querySelectorAll("calcite-flow-item")[1]
      .querySelector("arcgis-print-template-selector")
      .shadowRoot.querySelector("div.template-select-flow-item-container")
      .querySelector("div.template-select-flow-item-content").style.display =
      "none";

    document.querySelector("#print").style.display = "flex";
    document.querySelector(
      "#print",
    ).childElem.childNodes[1].childNodes[0].style.display = "flex"; // Exporter PDF
    document.querySelector(
      "#print",
    ).childElem.childNodes[1].childNodes[1].style.display = "flex"; // Choose Template A3 A4
  }

  function updateExtentWhenNeeded() {
    // window.updatePrintExtent();
    updatePrintExtent();

    zoomAfterFormatSelection();
  }

  const search = document.getElementById("search");
  const introDialogOkBtn = document.getElementById("intro-dialog-ok-btn");

  search.view = view;

  search.sources = [
    {
      url: Config.adressLocatorUrl,
      singleLineFieldName: "SingleLine",
      name: "Adress",
      placeholder: "Sök fastighet eller adress...",
      zoomScale: 500,
      enableSuggestions: true,
    },
    {
      url: Config.fastighetLocatorUrl,
      singleLineFieldName: "SingleLine",
      name: "Fastighet",
      placeholder: "Sök fastighet eller adress...",
      zoomScale: 500,
      enableSuggestions: true,
    },
  ];

  introDialogOkBtn.addEventListener("click", async (event) => {
    document.getElementById("intro-dialog").open = false;
  });

  const setScaleAndFormat = () => {

    const updateScale = () => {
      if (arcgisPrint.templateOptions) {
        arcgisPrint.templateOptions.scaleEnabled = true;
        arcgisPrint.templateOptions.scale = parseInt(
          document.getElementById("esri-scale-select").selectedOption.textContent,
        );
      }
    }

    const updateFormat = () => {
      if (arcgisPrint.templateOptions) {
        arcgisPrint.templateOptions.layout = document.getElementById("esri-template-select").value;
      }
    }

    pdfScale = document.getElementById("esri-scale-select");
    pdfScale.addEventListener("calciteSelectChange", (event) => {
      updateScale();
      updatePrintExtent();
    });

    let selectTemplate = document.getElementById("esri-template-select");
    selectTemplate.addEventListener("calciteSelectChange", (event) => {
      updateFormat();
      updatePrintExtent();

      formatPDF = selectTemplate.value;
    });
    updateScale();
    updateFormat();
  };

  search.addEventListener("arcgisSelectResult", async (event) => {
    // FULL ORIGINAL RESULT
  const fullResultName = event?.detail?.result?.name || "";

  // SPLIT ONLY FOR DISPLAY
  const shortResultName = fullResultName.split(",")[0];

  // Use shortened title
  if (arcgisPrint.templateOptions) {
    arcgisPrint.templateOptions.title = shortResultName;
  }

    updatePrintExtent();

    handlePopupAction(event);

    let restartPDFButton = document.getElementById("esri-restart-modal-button");

    restartPDFButton.addEventListener("click", (event) => {
      location.reload();
    });

    let settingPDFButton = document.getElementById(
      "esri-setting-ok-modal-button",
    );

    searchResult = event.detail.result;

    settingPDFButton.addEventListener("click", (event) => {
      updatePrintExtent();
      zoomAfterFormatSelection();
      const printWidget = view.ui.find("print");

      view.popup.watch("visible", (visible) => {
        if (!visible) {
          openPrintDialog(searchResult);
          setScaleAndFormat();
          view.graphics.removeAll();
        }
      });

      setScaleAndFormat();

      document.querySelector("arcgis-map").view.popup.visible = false;

      fastigheterPointGeoGraphic.destroy();

      modalEsriPrint.open = false;
    });

    setScaleAndFormat();

    modalEsriPrint.open = true;

    // getFastigheterName(event);
    updateExtentWhenNeeded();
  });

  view.on("pointer-up", function (event) {
    // Access the updated extent after panning
    updateExtentWhenNeeded();
  });

  function destroyWidget() {
    // Check if the Print widget exists in the view's UI
    const printWidget = view.ui.find("print");
    if (printWidget) {
      // Remove the widget from the view's UI and destroy it
      view.ui.remove(printWidget);
      printWidget.destroy();
    }
    return;
  }

  function zoomAfterFormatSelection() {
    let intervalZoom = setInterval(function () {
      var zoomInButton = document.querySelector("arcgis-zoom").childElem;
      // when count equals to 5, stop the function
      if (zoomInButton?.lastChild) {
        zoomInButton.click();
        clearInterval(intervalZoom);
      }
    }, 500);
  }

  function changePrintUI() {
    var printHeaderUI = document.querySelector(".esri-print__header-title");
    var printExportBtnrUI = document.querySelector(
      ".esri-print__export-button",
    );
    var printTitleBtnrUI = document.querySelector(
      "#print__layoutContent > div:nth-child(1) > div:nth-child(1) > label:first-child",
    ).firstChild;
    var printAdvanceOptBtnrUI = document.querySelector(
      ".esri-print__advanced-options-section",
    );
    var printExportedFileLabelUI = document.querySelector(
      "#viewDiv > div.esri-view-root > div.esri-ui.calcite-mode-light > div.esri-ui-inner-container.esri-ui-corner-container > div.esri-ui-top-right.esri-ui-corner > div > div > div > div",
    ).firstChild;
    var printExportedFileSubLabelUI = document.querySelector(
      "#viewDiv > div.esri-view-root > div.esri-ui.calcite-mode-light > div.esri-ui-inner-container.esri-ui-corner-container > div.esri-ui-top-right.esri-ui-corner > div > div > div > div > div > div",
    );
    var printPageSetupLabelUI = document.querySelector(
      "#print__layoutContent > div:nth-child(1) > div:nth-child(2) > label",
    ).firstChild;
    var printFileFormatLabelUI = document.querySelector(
      "#print__layoutContent > div:nth-child(1) > div:nth-child(3) > label",
    ).firstChild;
    var printSkaleFormatChangeUI = document.querySelector(
      "#print__layoutContent > div:nth-child(1) > div:nth-child(2) > label > select",
    );

    if (printHeaderUI.textContent) {
      const selectElement = printSkaleFormatChangeUI;

      selectElement.addEventListener("change", (event) => {
        updatePrintExtent();

        zoomAfterFormatSelection();
        window.formatState = false;
        if (event.returnValue === true) {
          window.state.formatUI =
            event.currentTarget.selectedOptions[0].textContent;
          window.formatState = true;
          document.getElementById("esri-template-select").value =
            event.currentTarget.value;
          window.state.formatPDF = event.currentTarget.value;
          updatePrintExtent();
        }
      });
      printHeaderUI.textContent = "Skriv ut PDF";
      printExportBtnrUI.textContent = "Skriv ut PDF";
      printTitleBtnrUI.textContent = "Titel";
      printAdvanceOptBtnrUI.style.display = "none";
      printExportedFileLabelUI.textContent =
        "Nedan hittar du din exporterade fil:";
      printExportedFileSubLabelUI.textContent =
        "Dina exporterade filer visas här.";
      printPageSetupLabelUI.textContent = "Sidinställningar.";
      printFileFormatLabelUI.textContent = "Utskriftsformat";
      document.querySelector(
        "#print__mapOnlyTab",
      ).parentElement.style.pointerEvents = "none";
      document.querySelector("#print__mapOnlyTab").style.display = "none";
      printSkaleFormatChangeUI.value = document.getElementById(
        "esri-template-select",
      ).value;
      clearInterval(window.state.intervalId);
    }
  }

  function setIntervalWhenchangePrintUI() {
    let counter = 0;
    window.state.intervalId = setInterval(() => {
      try {
        changePrintUI();
        counter++;
        if (counter >= 100) {
          clearInterval(window.state.intervalId);
        }
      } catch (error) {
        console.log(error);
      }
    }, 200);
  }

  window.submitPrintJob = function () {

    setIntervalWhenchangePrintUI();

    // use a requestInterceptor to monitor the print widget
    // for print completion
    esriConfig.request.interceptors.push({
      // set the `urls` property to the URL of the print service so that this
      // interceptor only applies to requests made to the print service URL
      urls: print.printServiceUrl,
      // use the AfterInterceptorCallback to interogate the exportedLinks property
      before: function (parameters) {
        if (parameters.requestOptions.query.Web_Map_as_JSON) {
          parameters.requestOptions.query.Layout_Template =
            window.state.formatPDF;
          let webMapAsJson = JSON.parse(
            parameters.requestOptions.query.Web_Map_as_JSON,
          );
          webMapAsJson.operationalLayers[0].opacity = 0;
          webMapAsJson.operationalLayers[1].opacity = 0;
          webMapAsJson.operationalLayers[2].opacity = 0;
          webMapAsJson.mapOptions.scale = parseInt(
            // window.state.scale.selectedOption.textContent,
            pdfScale.selectedOption.textContent,
          );
          webMapAsJson.mapOptions.extent = window.state.extent;

          parameters.requestOptions.query.Web_Map_as_JSON =
            JSON.stringify(webMapAsJson);
        }
      },
      after: function (response) {
      },
    });
  }; //END OF - window.submitPrintJob

  // Use a function to format the content of the popup
  function formatContent(event) {
    const printContent = PrintDialog.html();
    const attributes = event.graphic.attributes;
    let text = "";
    text += attributes.fastighet
      ? `Fastighet: "${attributes.fastighet}" ${attributes.fastighet}`
      : `Fastighet: ${attributes.fastighet}`;
    let textElement = new TextContent({
      text: printContent,
    });
    return [textElement];
  }
});
// End of view.when()
