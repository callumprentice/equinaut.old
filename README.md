## Equinaut
### About
* A web based [equirectangular](https://en.wikipedia.org/wiki/Equirectangular_projection) image viewer for desktop, mobile and VR HMD browsers
* This tool started life as something I made in my spare time for a project I was working on at [Second Life](https://secondlife.com) (my day job) which is why you might see some references to it in the code.
* The most common use case is to open the [site](https://equinaut.surge.sh) in your desktop browser and drag an equirectangular image from a folder or your desktop, onto the page to view it.
* In some cases, you can specify a remote image with the `eqr` URL parameter like [this](https://equinaut.surge.sh/?eqr=https://upload.wikimedia.org/wikipedia/commons/c/ce/Dortmund-Hafen-Sued-Ruine_Panorama_02.jpg) or [this](https://equinaut.surge.sh/?eqr=https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Brompton_Oratory_360x180%2C_London%2C_UK_-_Diliff.jpg/1920px-Brompton_Oratory_360x180%2C_London%2C_UK_-_Diliff.jpg) but this greatly depends on how the server where the image is hosted is configured. (Images from Wikimedia Commons [page](https://commons.wikimedia.org/wiki/Category:360%C2%B0_panoramas_with_equirectangular_projection))
* There are, as you might imagine, approximately a bazillion sites out there with example equirectangular images for you to explore. Some like [this](https://www.flickr.com/groups/equirectangular/) one or [this](https://stock.adobe.com/search?k=equirectangular) one will let you download an image that you can then drag onto the Equinaut page and view it. You can of course, always try a Google [image search](https://www.google.com/search?q=equirectangular+image+examples) too. Please do make sure you follow the licensing/usage terms on whicever site you are using.
* The source code is available [here](https://github.com/callumprentice/equinaut).
* I publish a minified version of the site online [here](https://equinaut.surge.sh/).
* You can of course clone the repository and publish it yourself subject to the terms of the [license](https://github.com/callumprentice/equinaut/blob/main/LICENSE.txt). Please do let me know if you find it useful.
* I am hoping to expand and improve it as time permits but please do submit an [issue](https://github.com/callumprentice/equinaut/issues) if something appears to be broken or you would like to suggest a new feature.
* You can contact me via my own site [here](https://callum.com).
* Credit and thanks to the [three.js](https://threejs.org/) and [isMobile](https://github.com/kaimallea/isMobile) authors for making great tools. 

### Supported devices
#### Desktop browsers
* Tested (somewhat) on Chrome 91+ (macOS) and Safari 14+
* After the page loads, you can drag an equirectangular image from your desktop or a folder onto the page and it will be displayed

#### Mobile device browsers
* Tested (somewhat) on the iPhone/iPad with Chrome 91+
* Uses the device orientation to rotate the image

#### VR HMD based browsers
* Tested (somewhat) on the Oculus Quest 2 with the Oculus Browser 91+

### Controls
#### Mouse (works in all modes)
* Hold down the left mouse button and move the mouse to explore the panorama
  * You can change the way the image is dragged using the `add` URL parameter (see reference table below)
* After the panorama loads, it will slowly rotate until you interact with it.
  * You can double click the left mouse button to restart this rotation.
  * You can turn this on or off by default using the `ar` URL parameter (see reference table below)

#### Buttons
<img align="left" width="64" height="64" src="img/full_screen.png"></img>
Switches the display to full screen.<br>Click the button again or follow the instructions given by your browser to exit full screen
<p><br>
<img align="left" width="64" height="64" src="img/settings.png"></img>
Open a settings panel that displays some information about the embedded metadata in the image. I hope to expand on this in the future.
<p><br>
<img align="left" width="64" height="64" src="img/sl.png"></img>
If the panorama was created by Second Life, clicking this will open the Second Life SLURL and let you visit that Second Life location directly.
<p><br>
<img align="left" width="64" height="64" src="img/help.png"></img>
Rudimentary help. For the moment, opens this page in a new browser window.
<p><br>

### URL parameters
|||
|---|---|
|**Name**|`add`|
|Description|Enable or disable the alternative drag direction. Default is to drag the image in the same direction as the mouse moves. Enabling this option reverses that.|
|Example|`?add=true` or `?add=y` or `?add=1`|
|Example|`?add=false` or `?add=n` or `?add=0`|
|||
|**Name**|`ar`|
|Description|Enable or disable the auto rotation. If auto rotation is enabled, clicking on the image will stop and double-click will start. If auto rotation is disabled, double-clicking will start.|
|Example|`?ar=true` or `?ar=y` or `?ar=1`|
|Example|`?ar=false` or `?ar=n` or `?ar=0`|
|||
|**Name**|`dd`|
|Description |Enable or disable drag drop feature.|
|Example |`?dd=true` or `?dd=y` or `?dd=1`|
|Example |`?dd=false` or `?dd=n` or `?dd=0`|
|||
|**Name**|`doc`|
|Description |Enable or disable device orientation controls. When using a mobile device, the default controls use the device orientation to move around the scene. If you prefer to touch and drag on a mobile device, disable this option. This option has no effect on desktop or VR browsers.|
|Example |`?doc=true` or `?doc=y` or `?doc=1`|
|Example |`?doc=false` or `?doc=n` or `?doc=0`|
|||
|**Name**|`egg`|
|Description |An easter - turn it on and see what happens :)|
|Example |`?egg=true`|
|Example|`?egg=1`|
|||
|**Name**|`eqr`|
|Description |Specify the equirectangular image to view. You can either specify a local image filename or a full image URL (The target must have a valid `crossorigin` attribute)|
|Example |`?eqr=pano/default.jpg`|
|Example|`?eqr=https://example.com/eqr.jpg`|
|||
|**Name**|`mobile`|
|Description|Enable or disable mobile browser mode. This feature is normally autodetected but this can be used to override.|
|Example|`?mobile=true` or `?mobile=y` or `?mobile=1`|
|Example|`?mobile=false` or `?mobile=n` or `?mobile=0`|
|||
|**Name**|`ui`|
|Description |Enable or disable UI (turning it off will disable some features).|
|Example |`?ui=true` or `?ui=y` or `?ui=1`|
|Example |`?ui=false` or `?ui=n` or `?ui=0`|
|||
|**Name**|`vr`|
|Description|Enable or disable VR browser mode. This feature is normally autodetected but this can be used to override.|
|Example|`?vr=true` or `?vr=y` or `?vr=1`|
|Example|`?vr=false` or `?vr=n` or `?vr=0`|
|||


### For the future
Here are some of the things I have in mind to work on next:
* Navigation. Next feature I would like to work on is an editor that lets you interactively define 'hot spots' in an equirectangular image that link to other images when clicked.
* Image upload. You can drag an image from your computer onto the page to see it locally but you cannot share it with others. There should be a way to upload an image and share that link with anyone. Technically it's not difficult but paying for disk space on a server somewhere can get expensive quickly so I need a robust plan for that
* Better desktop and mobile browser support. I only use Chrome but there are several other great browsers out there and I should make sure it works on all of them
* Support for other VR HMD devices. I only have an Oculus Quest 2 so I cannot test on anything else. If you have a different device and find any problems, please let me know.

### Alternatives
There are plenty of great alternatives out there - here are some I found but there are many more:
* [Online 360° Panorama Viewer VR](https://renderstuff.com/tools/360-panorama-web-viewer/)
* [360-image-viewer](https://www.npmjs.com/package/360-image-viewer)
* [Pannellum](https://pannellum.org/)
* [Marzipano](https://www.marzipano.net/)
* [Google VR](https://developers.google.com/vr/discover/360-degree-media)
