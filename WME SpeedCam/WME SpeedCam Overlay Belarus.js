// ==UserScript==
// @name                WME SpeedCam Overlay Belarus
// @author	            someone
// @description         Overlay speedcams for Belarus
// @include             https://www.waze.com/editor/*
// @include             https://www.waze.com/*/editor/*
// @include             https://editor-beta.waze.com/*
// @version             0.3.1
// @grant               none
// @namespace           
// ==/UserScript==


function bootstrapSpeedCamBY()
{
    var bGreasemonkeyServiceDefined = false;

    try {
        bGreasemonkeyServiceDefined = (typeof Components.interfaces.gmIGreasemonkeyService === "object");
    }
    catch (err) { /* Ignore */ }

    if (typeof unsafeWindow === "undefined" || ! bGreasemonkeyServiceDefined) {
        unsafeWindow    = ( function () {
            var dummyElem = document.createElement('p');
            dummyElem.setAttribute('onclick', 'return window;');
            return dummyElem.onclick();
        }) ();
    }

    setTimeout(initializeSpeedCamBY, 999);

}

function getElementsByClassName(classname, node) {
    node || (node = document.getElementsByTagName("body")[0]);
    for (var a = [], re = new RegExp("\\b" + classname + "\\b"), els = node.getElementsByTagName("*"), i = 0, j = els.length;i < j;i++) {
        re.test(els[i].className) && a.push(els[i]);
    }
    return a;
}

function checkLayerNum()
{
    var scbyLayer = null;
    for(i=0; i<Waze.map.layers.length; i++)
      {
         if(Waze.map.layers[i].uniqueName == '__speedcamby') scbyLayer = i;
      }
    //console.log('WME SCBY: layer number = ' + scbyLayer);
    return scbyLayer;
}

function getBounds()
{
   	var Bounds = Waze.map.getExtent();

    Bounds.transform(new OpenLayers.Projection("EPSG:900913"),new OpenLayers.Projection("EPSG:4326"));
    //console.log('WME SCBY: Current bounds = Left ' + Bounds.left + ', Right ' + Bounds.right + ', Bottom ' + Bounds.bottom + ', Top ' + Bounds.top);//verify transform

    return Bounds;
}

function getSpeedCamBY(){

    SpeedCamBY_Layer.destroyFeatures();

    var Bounds = getBounds();
    var url = "https://raw.githubusercontent.com/Vinkoy/WME-Scripts/master/WME%20SpeedCam/sc";
    var data = {
      format: "JSON",
      types: "speedcam",
      left: Bounds.left,
      right: Bounds.right,
      bottom: Bounds.top,
      top: Bounds.bottom
    };

    $.ajax({
        dataType: "json",
        url: url,
        success: function(json) {

            var Data = json.speedcam;
            try {
                for(var i=0; i<Data.length; i++) {
                    var lat = Data[i].lat;
                    var long = Data[i].lon;
                    var descr = Data[i].txt;

//                    console.log("WME SCBY: " + Data[i].txt, Data[i].lon, Data[i].lat);
                    addImage(lat,long,Data[i].txt);
                }
            }
            catch(e) {
//                console.log('WME SCBY: No Speedcams in view');
            }
        }
    });
}

function addImage(lat, long, detail) {

  var coords = OpenLayers.Layer.SphericalMercator.forwardMercator(long, lat);
  var point = new OpenLayers.Geometry.Point(coords.lon,coords.lat);
  var px = Waze.map.getPixelFromLonLat(new OpenLayers.LonLat(coords.lon,coords.lat));
  var imgRoot = '/assets';

  var attributes = {
      description: detail,
      pixel: px
  };

  var icon;
  if(detail.indexOf("ПКО") > -1)
  {
      icon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB8AAAAdCAYAAABSZrcyAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjMyM0IyRUU1NkQ5NTExRTM5Mjk3QURBM0M5MDRFMDQ5IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjMyM0IyRUU2NkQ5NTExRTM5Mjk3QURBM0M5MDRFMDQ5Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MzIzQjJFRTM2RDk1MTFFMzkyOTdBREEzQzkwNEUwNDkiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MzIzQjJFRTQ2RDk1MTFFMzkyOTdBREEzQzkwNEUwNDkiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz75K+MnAAAFfklEQVR42rRWXYhVVRT+1t7nnntnxtHRJsIi7Q98CKwMeihSGbOStP9IgoiiB30oqIiKoN+HyqciggqSHhOtUPQhzVFDH/oZrF5KgsoolUHHlNS5956zd9/a+5x7rzPOOP24ueeec/ZeZ33r51trb/HeY7Kxb9+uyQUmHzJv3qKJFycDV+A9nz/2r5FvuOntSQ2YELwT+KILT+DmxfunDLp151z8caDnrAaY/xtYh8rrdzoKPZ46zw7+X4H/iQHmXABP1QBzroCnYkAgnALv3vIs0p6jEPFoZAmXMq6m8LyLq9BMB+ccrDHwPochT53QdhEueT67oFD1iVhegpzzwu8SL5wXZJLD5TNx6/J3MOfSBRLAP3j3en/Lwi8xo7cKY3MkCUGoOCo0sN5Ba8Ij558JinUouDjOWd4zgTMCQQOO3yR8Ulkv0SAnGZK0gt9/a2Bw9214ePVmURfRN30Ys/pTVEwTiY2lJxTmPwEbESz1wRCn3rgQMyQmD4nzeQ5pJIrSSqTjunHUwRB5R+OMQjUxd65Bvmc//NEEAdyaCrK6Q62nnSsNU8wLrbdA/XhCOSq0ZV9gWCnTbPLKDHr7mJ5G/E5gCZzTa3XbqSWUpYEmpsgGQxDB89whpWfhQ/Glbv0FYOSCaurGkclSwFY91xgBGlHYG3nSojQTUY/cJl1wqpmgWm222W4426gLTp4StBoe740mvc6lIxo447NIp0leMxIMEUfLGXJ1rFJhmhJ6bTOkVjpKzSuTo8Lt3EfseS5ctQtIkuJZr/c/BLbtQHj+pahEle+/PK6X7q56UmWYovMz2FkOq57wLQOrKfBX3bfBlbBd3S4IlEJbP2FpHCY5jhj8NGQKDz06AlMAeTz6IHM6YgL2ykc8tn3h8fUg2X9EsPVTYMMmj/s574powidtcA1RzvB2d+Wn7zqCce+dc+r1z78CK5aZYM033wLrNwKvvyhYcJXqdViyWPDaC4INGz2G9pJkyv6so8MJWeWclpWMI9XYTc+7KPPnMeC5lz3uvUMw/8o4t31nFL5vhYTy1ErRoTLRWHrOfpBU8zbbxWQh7zKFdukKY64bcJjZB3y0ViPmo5GlAutCKo3E3qByEceHyuvtzuJrKDV6093r2mU2wfAdqfhq0KBvhuaYZCtqvxUlWqgMiM3FY/iwlNWLWs2xL4SyLeIS6tuMCbeMy7sUpAtdkcDr1hoMfcfwvxLnBm6Mwus32dBgRCuNFq37OM4vWRRLuT5aiznXNlch00eGk9OAznTA8UXDLQ259mrg1ecN1rzlA6H0/Z7bhVxwgYzqwOAOg5feyHDXcsE182OUs0J3yLlvxlIbCzTuzIVYFbparj/9uGDv9xJKbs7FwmgIVj/FrfRu39Ly0EqL996MUbTcD3zRXsSNWGz57BK/dGA/0kobUkGsbb9rNWjrythGtVN1lp1G6dhxw3witOHOCOp3oT/4GPITJyw2D16BB+78Me5qlao2+zF9O3HR1wLfmMjoNPWnpaY0Yto039oRy/nyO3VE7zqnhHO5bdW5WG4MuRvTr3X31vIrtJRrei+fOz3UHa8zZepxg1HKy72hMLLCGs/ydpPxGVveaN3ERuPjXu29CRtOsErbD1OicRINuXooBQlMoG1gtj7X61JUikZC02d5iJBwEhJ2PMN7SbgQ7IOHZlOoiZFjSUtpEOSZhP2Qr9zd9BBRlh9sWPckD09GfHfRLd5qvZxjyk6OWljmP+2uR0aHwhYcOsgy9LPbhPvhwHa/c9szmN47gqzRxSZAzw0PBHqKYQRyuhyOUgRUKjSMOqvnN1c0ExvOZ1bPaCygWtJEtZty3KJH65VAODXbQdPbh6XL1uCy/oUSwM/RkAkqtjX+FmAALz3DhqeKouAAAAAASUVORK5CYII=";
  }
  else
  {
      icon = 'data:image/png;base64,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';
  }

  var style = {
    externalGraphic: icon,
    graphicWidth: 28,
    graphicHeight: 29,
    fillOpacity: 1,
    title: 'SpeedCam',
    cursor: 'help'
  };

  var imageFeature = new OpenLayers.Feature.Vector(point, attributes, style);

  SpeedCamBY_Layer.addFeatures([imageFeature]);
//  console.log('WME SCBY: Added SpeedCam at ' + lat + ',' + long + '('+ px +')');

}

function initializeSpeedCamBY()
{
//    console.log("WME SCBY: Initializing");

    var scbyVisibility = true;
    
    SpeedCamBY_Layer = new OpenLayers.Layer.Vector("Speedcam BY",{
            rendererOptions: { zIndexing: true },
     		uniqueName: '__speedcamby'
        }
    );
    I18n.translations[I18n.locale].layers.name["__speedcamby"] = "Speedcam BY";
    
// ======================================================================
  	var oldTogglers = document.querySelector('.togglers');
        
    if (document.querySelector('.layer-switcher-group_scripts') === null)
    {
      var newScriptsToggler = document.createElement('li');
      newScriptsToggler.className = 'group';
      newScriptsToggler.innerHTML = '<div class="controls-container toggler">\
					<input class="layer-switcher-group_scripts toggle" id="layer-switcher-group_scripts" type="checkbox">\
					<label for="layer-switcher-group_scripts">\
					<span class="label-text">Scripts</span>\
					</label>\
					</div>\
					<ul class="children">\
					</ul>';	
      oldTogglers.appendChild(newScriptsToggler);
  
    }

    var SCBY_toggle = document.createElement('li');
    SCBY_toggle.innerHTML = '<div class="controls-container toggler">\
                              <input class="layer-switcher-item_WMESpeedCamBY toggle" id="layer-switcher-item_WMESpeedCamBY" type="checkbox">\
                              <label for="layer-switcher-item_WMESpeedCamBY">\
                                <span class="label-text">Speedcam BY</span>\
                              </label>\
                            </div>';
    
    
    var groupScripts = document.querySelector('.layer-switcher-group_scripts').parentNode.parentNode;
    var newScriptsChildren = getElementsByClassName("children", groupScripts)[0];
    newScriptsChildren.appendChild(SCBY_toggle);
    
      
    var toggler = document.getElementById('layer-switcher-item_WMESpeedCamBY');
    var groupToggler = document.getElementById('layer-switcher-group_scripts');
    groupToggler.checked = (typeof(localStorage.groupScriptsToggler) !=="undefined" ?
    	JSON.parse(localStorage.groupScriptsToggler) : true);

    toggler.disabled = !groupToggler.checked;
    
    toggler.addEventListener('click', function(e) {
        SpeedCamBY_Layer.setVisibility(e.target.checked);
    });
    
    groupToggler.addEventListener('click', function(e) {
        toggler.disabled = !e.target.checked;
        SpeedCamBY_Layer.setVisibility(toggler.checked ? e.target.checked : toggler.checked);
        localStorage.setItem('groupScriptsToggler', e.target.checked);
    });

// ======================================================================
    
    // restore saved settings
    if (localStorage.WMESpeedCamBY) {
//        console.log("WME SCBY: loading options");
        var options = JSON.parse(localStorage.getItem("WMESpeedCamBY"));

        scbyVisibility = options[0] && groupToggler.checked;
        toggler.checked = scbyVisibility;
    }
    
    // overload the WME exit function
    saveSCBYOptions = function() {
        if (localStorage) {
//            console.log("WME SCBY: saving options");
            var options = [];

            scbyVisibility = toggler.checked;
            options[0] = scbyVisibility;

            localStorage.setItem("WMESpeedCamBY", JSON.stringify(options));
        }
    };
    
    window.addEventListener("beforeunload", saveSCBYOptions, false);

    function showSpeedCamPopup(f){

        //shift popup if SC panel is visible
        try{
          scX = f.attributes.pixel.x+200;
          scY = f.attributes.pixel.y+15;
//          console.log('WME SCBY: shift popup ('+scX+','+scY+')');
          divSCBY.style.top = scY+'px';
          divSCBY.style.left = scX+'px';
        }
        catch(e){
            console.log('WME SCBY: Could not shift popup');
        }

        var attributes = f.attributes;

        var scDescription = ((attributes.description === null) ? "" : attributes.description);

        document.getElementById("divSCBY").innerHTML = "<b>" + scDescription + "</b>";
        divSCBY.style.visibility = 'visible';
    }

    function hideSpeedCamPopup(){
        divSCBY.style.visibility = 'hidden';
//       console.log('WME SCBY: popup divSCBY X:'+divSCBY.style.left+' Y:'+divSCBY.style.top);
}

console.log('WME SCBY: scbyVisibility:'+scbyVisibility);
    SpeedCamBY_Layer.setZIndex(9999);
    Waze.map.addLayer(SpeedCamBY_Layer);
    Waze.map.addControl(new OpenLayers.Control.DrawFeature(SpeedCamBY_Layer, OpenLayers.Handler.Path));
    SpeedCamBY_Layer.setVisibility(scbyVisibility);

    var divPopupCheck = document.getElementById('divSCBY');
    if (divPopupCheck === null){
        divSCBY = document.createElement('div');
        divSCBY.id = "divSCBY";
        divSCBY.style.position = 'absolute';
        divSCBY.style.visibility = 'hidden';
        divSCBY.style.zIndex = 1000;
        divSCBY.style.backgroundColor = '#FFFF80';
        divSCBY.style.borderWidth = '2px';
        divSCBY.style.borderStyle = 'solid';
        divSCBY.style.borderRadius = '5px';
        divSCBY.style.boxShadow = '5px 5px 5px rgba(50, 50, 50, 0.3)';
        divSCBY.style.padding = '5px';
        document.body.appendChild(divSCBY);
//        console.log('WME SCBY: Creating popup divSCBY');
    }

    //clear existing SCBY features
    SpeedCamBY_Layer.destroyFeatures();

    var scbyLayer = checkLayerNum();

    Waze.map.events.register("mousemove", Waze.map, function(e) {
        hideSpeedCamPopup();
        var position = this.events.getMousePosition(e);
        //console.log('WME SCBY: coords xy = ' + position.x + ' ' + position.y);
        var scbyLayer = checkLayerNum();
        if(Waze.map.layers[scbyLayer].features.length > 0){

            //var scCount = Waze.map.layers[scbyLayer].features.length;
            //console.log('WME SCBY: Current Speedcam count = ' + scCount);

            var scFeatures = Waze.map.layers[scbyLayer];
            for(j=0; j<Waze.map.layers[scbyLayer].features.length; j++){

                var scbyLayerVisibility = SpeedCamBY_Layer.getVisibility();
                var scX = scFeatures.features[j].attributes.pixel.x;
                var scY = scFeatures.features[j].attributes.pixel.y;
                if(scbyLayerVisibility === true && position.x > scX - 10 && position.x < scX + 10 && position.y > scY - 15 && position.y < scY + 15){
//                	console.log('WME SCBY: hover over Speedcam ('+scX+','+scY+')');
                    showSpeedCamPopup(scFeatures.features[j]);
                }
            }
        }
    });

    //refresh if user moves map
    Waze.map.events.register("moveend", Waze.map, getSpeedCamBY);

    window.setTimeout(getSpeedCamBY(), 500);

}

bootstrapSpeedCamBY();