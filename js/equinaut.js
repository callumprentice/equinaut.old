/**
 * @file equinaut.js
 *
 * @brief View equirectangular images - see README.md for details
 *
 * @author Callum Prentice (callum@gmail.com)
 *
 * @license See LICENSE.txt
 */

import * as THREE from './jsm/three.module.js';
import { OrbitControls } from './jsm/OrbitControls.js';
import { DeviceOrientationControls } from './jsm/DeviceOrientationControls.js';
import { VRButton } from './jsm/VRButton.js';

var camera, scene, renderer, controls, settings;

document.addEventListener('DOMContentLoaded', check_for_vr);

// The first check we do at app startup.  We do not use
// any third party libraries, but rather, rely on the
// support built into three.js
function check_for_vr() {
    if (navigator.xr) {
        navigator.xr.isSessionSupported('immersive-vr').then((is_vr_supported) => {
            settings = check_url_params(is_vr_supported);
            start_app();
        });
    } else {
        settings = check_url_params(false);
        start_app();
    }
}

// This is where we start once the DOM content is loadedß
function start_app() {
    console.log(`App version 1.0.8, three.js version ${THREE.REVISION}`);
    console.table('Settings in play:', settings);

    // not on a mobile device so show the loading screen
    if (settings.mobile === false) {
        show_div('loading_overlay', true);

        // initialize and we're off
        init(settings);
    } else {
        // on a mobile device - start with loading screen
        show_div('loading_overlay', false);

        // then display the mobile overlay with a button.
        // this is required on mobile devices - you need to
        // interact with the page first
        show_div('mobile_overlay', true);
        show_div('btn_container', false);

        // wait for user to click the button we display
        var mobile_start_btn = document.getElementById('mobile_start_btn');
        mobile_start_btn.addEventListener('click', function () {
            show_div('mobile_overlay', false);
            show_div('loading_overlay', true);

            // initalize and we're off (on mobile)
            init(settings);
        });
    }
}

function init(settings) {
    var size = get_container_size();
    camera = new THREE.PerspectiveCamera(75, size.width / size.height, 0.1, 100);

    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(size.width, size.height);

    // some special code for VR
    if (settings.vr) {
        renderer.xr.enabled = true;
        renderer.xr.setReferenceSpaceType('local');

        // this is particular to the Quest 2 I think
        renderer.xr.setFramebufferScaleFactor(2.0);

        // VR mode also needs a button click before
        // we can proceed so show one
        document.body.appendChild(VRButton.createButton(renderer));
    }

    get_container().appendChild(renderer.domElement);

    // we provide an option to hide all the UI
    if (settings.ui == false) {
        show_div('btn_container', false);
    }

    // if we are not on a mobile device or the user elected to
    // disable the device orientation controls, use the regular
    // three.js Orbit controls
    if (settings.mobile == false || settings.doc == false) {
        controls = new OrbitControls(camera, renderer.domElement);
        controls.autoRotate = settings.ar;
        controls.autoRotateSpeed = 0.35;
        controls.enableZoom = false;
        controls.enablePan = false;
        controls.enableDamping = true;
        controls.dampingFactor = 0.15;
        controls.rotateSpeed = settings.add == false ? -0.5 : 0.5;
    } else {
        // use the device orientation control provided by three.js
        // to naviate with our mobile device
        controls = new DeviceOrientationControls(camera);
    }

    // need to light scene if we add other geometry
    var ambient = new THREE.AmbientLight(0xffffff);
    scene.add(ambient);

    // a bit of fun
    if (settings.egg) {
        egg_init();
    }

    // generic function to update pano, UI, settings etc.
    update_pano(settings.eqr);

    // listen for mouse events so that we can stop the auto
    // rotation when the user interacts with the scene
    get_container().addEventListener(
        'mousedown',
        function (event) {
            controls.autoRotate = false;
        },
        false
    );

    // listen for mouse double click events so that we can
    //  restart the autorotation after it was stopped
    get_container().addEventListener(
        'dblclick',
        function (event) {
            controls.autoRotate = true;
        },
        false
    );

    // hook up on screen buttons to their relevant functions
    document.getElementById('settings_btn').addEventListener('click', function () {
        toggle_settings();
    });
    document.getElementById('full_screen_btn').addEventListener('click', function () {
        toggle_full_screen();
    });
    document.getElementById('help_btn').addEventListener('click', function () {
        show_help();
    });

    // we allow users to drag/drop images onto the page to
    // display this and provide an option to disable if they
    // do not want this feature
    if (settings.dd == true) {
        configure_drag_drop();
    }

    // watch resize events - when the user resizes the window,
    // opens the JS console, opens the settings draw etc.
    new ResizeObserver(handle_resize).observe(document.getElementById('app_container'));

    // different code required for VR mode ws non-VR mode
    if (settings.vr) {
        vr_animate();
    } else {
        animate();
    }
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();

    if (settings.egg) {
        egg_animate();
    }

    renderer.render(scene, camera);
}

function vr_animate() {
    renderer.setAnimationLoop(render);
}

function render() {
    if (settings.egg) {
        egg_animate();
    }

    renderer.render(scene, camera);
}

function handle_resize() {
    var size = get_container_size();
    camera.aspect = size.width / size.height;
    camera.updateProjectionMatrix();
    renderer.setSize(size.width, size.height);

    renderer.render(scene, camera);
}

function get_container() {
    if (typeof get_container.elem === 'undefined') {
        get_container.elem = document.getElementById('app_container');
    }

    return get_container.elem;
}

function get_container_size() {
    return {
        width: get_container().clientWidth,
        height: get_container().clientHeight,
    };
}

function configure_drag_drop() {
    // listen for drag/drop events - over the page
    get_container().addEventListener(
        'dragover',
        function (event) {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'copy';
        },
        false
    );

    // listen for drag/drop events - enter the page
    // note - we have to keep a count of the divs we
    // pass over so we know when we are really leaving
    var enter_leave_counter = 0;
    get_container().addEventListener(
        'dragenter',
        function (event) {
            enter_leave_counter++;
            document.body.style.opacity = 1.0;
        },
        false
    );

    // listen for drag/drop events - leave the page
    // note - we have to keep a count of the divs we
    // pass over so we know when we are really leaving
    get_container().addEventListener(
        'dragleave',
        function (event) {
            enter_leave_counter--;
            // we really left so reset the opacity
            if (enter_leave_counter == 0) {
                document.body.style.opacity = 1.0;
            }
        },
        false
    );

    // listen for drag/drop events - target was dropped
    // on the page so load it as normal
    get_container().addEventListener(
        'drop',
        function (event) {
            event.preventDefault();
            var reader = new FileReader();
            reader.addEventListener(
                'load',
                function (event) {
                    update_pano(event.target.result);
                },
                false
            );
            reader.readAsDataURL(event.dataTransfer.files[0]);

            // reset the opacity once the image is loaded
            document.body.style.opacity = 1.0;
        },
        false
    );
}

function update_pano(filename) {
    fetch(filename)
        .then(function (response) {
            if (response.ok) {
                return response.blob();
            }
            throw new Error('Network response indicated an error');
        })
        .then(function (blob) {
            var reader = new window.FileReader();

            // when the image is loaded, we need to munge the result
            // into something three.js can can consume
            reader.onloadend = function () {
                var texture = new THREE.Texture();
                var image = new Image();
                image.src = URL.createObjectURL(blob);

                // important to wait for the image to be loaded since the
                // loading happens asynchronously
                image.onload = function () {
                    texture.image = image;

                    // displaying the equi is as simple as setting the
                    // scene background to our image..
                    scene.background = texture;

                    // in this application, we assume it's an equirectangular image
                    // even if that's not the case and the XMP flag is missing/unset
                    texture.mapping = THREE.EquirectangularReflectionMapping;
                    texture.minFilter = texture.magFilter = THREE.LinearFilter;

                    // a bit of fun
                    if (settings.egg) {
                        egg_new_pano(texture);
                    }

                    // tell three.js we loaded and updated texture so it needs to
                    // do some internal accounting to take care of it
                    texture.needsUpdate = true;

                    // extract the XMP metadata tags from the image so we can use later
                    let tags = extract_xmp_tags(reader.result);

                    // add tags to the settings drawer
                    update_settings_display(tags);

                    // update the title depending on what (XMP tags) we find in the image
                    update_title(tags);

                    // update the camera to look in the direction recorded in the XMP data
                    update_camera(tags);

                    // once we get here, the image is loaded so we can pull down the
                    // loading overlay and reveal the scene
                    show_div('loading_overlay', false);
                };
            };

            reader.readAsBinaryString(blob);
        })
        // unable to load the image (bad URL etc.)
        .catch(function (error) {
            show_div('loading_overlay', false);
            show_div('error_overlay', true);
            console.log('Unable to fetch the requested panorama image: ' + error.message);
        });
}

// opens and closes the settings drawer by toggling
// the class list for this div - see css file for details
function toggle_settings() {
    document.getElementById('app_container').classList.toggle('closed');
}

function show_help() {
    var help_url = 'https://github.com/callumprentice/equinaut/blob/master/README.md';
    window.open(help_url, '_blank');
}

// utility function, triggered by a button defined in HTML
// to switch to full screen mode (and back).  Might be useful
// for presenting or showing the panorama in all its' glory!
function toggle_full_screen() {
    var elem = document.documentElement;

    if (!document.fullscreenElement) {
        elem.requestFullscreen().catch((err) => {
            alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
    } else {
        document.exitFullscreen();
    }
}

function get_query_parameter_by_name(name) {
    var url = new URL(window.location);
    var param = url.searchParams.get(name);
    return param;
}

function check_url_param_bool(param) {
    var bool_param = get_query_parameter_by_name(param).toLowerCase();
    if (bool_param === '1' || bool_param === 'true' || bool_param === 'y') {
        return true;
    } else {
        return false;
    }
}

function check_url_params(vr_supported) {
    var alt_drag_dir = false;
    if (get_query_parameter_by_name('add') != null) {
        alt_drag_dir = check_url_param_bool('add');
    }

    var auto_rotate = true;
    if (get_query_parameter_by_name('ar') != null) {
        auto_rotate = check_url_param_bool('ar');
    }

    var allow_drag_drop = true;
    if (get_query_parameter_by_name('dd') != null) {
        allow_drag_drop = check_url_param_bool('dd');
    }

    var device_orientation_control = true;
    if (get_query_parameter_by_name('doc') != null) {
        device_orientation_control = check_url_param_bool('doc');
    }

    var egg_on = false;
    if (get_query_parameter_by_name('egg') != null) {
        egg_on = get_query_parameter_by_name('egg');
    }

    var eqr_img_url = 'panos/default.jpg';
    if (get_query_parameter_by_name('eqr') != null) {
        eqr_img_url = get_query_parameter_by_name('eqr');
    }

    var is_mobile = isMobile.any;
    if (get_query_parameter_by_name('mobile') != null) {
        is_mobile = check_url_param_bool('mobile');
    }

    var show_ui = true;
    if (get_query_parameter_by_name('ui') != null) {
        show_ui = check_url_param_bool('ui');
    }

    var is_vr = vr_supported;
    if (get_query_parameter_by_name('vr') != null) {
        is_vr = check_url_param_bool('vr');
    }

    return {
        add: alt_drag_dir,
        ar: auto_rotate,
        dd: allow_drag_drop,
        doc: device_orientation_control,
        egg: egg_on,
        eqr: eqr_img_url,
        mobile: is_mobile,
        ui: show_ui,
        vr: is_vr,
    };
}

function show_div(div_id, show) {
    var elem = document.getElementById(div_id);
    if (elem != undefined) {
        if (show) {
            elem.style.display = 'flex';
        } else {
            elem.style.display = 'none';
        }
    }
}

// scan through the binary image data and in this case,
// we are looking for an XMP tag embedded in the image
function getTagFromBinaryStream(stream, start_marker, end_marker) {
    var start_offset = stream.indexOf(start_marker);
    if (start_offset != -1) {
        var end_offset = stream.indexOf(end_marker, start_offset + start_marker.length + 1);
        if (end_offset != -1) {
            var tag_value = stream.slice(start_offset + start_marker.length, end_offset);
            return tag_value;
        }
    }
    return '';
}

// read out all the XMP tags and return them - I
// suspect we will eventually add more to this list
// Note: there are some Second Life 360 pano specifc
// tags here that nothing except the Second Life Viewer
// will ever write
function extract_xmp_tags(binary_blob) {
    return {
        projection_type: getTagFromBinaryStream(binary_blob, '<GPano:ProjectionType>', '</GPano:ProjectionType>'),
        use_panorama_viewer: getTagFromBinaryStream(
            binary_blob,
            '<GPano:UsePanoramaViewer>',
            '</GPano:UsePanoramaViewer>'
        ),
        full_pano_width_pixels: getTagFromBinaryStream(
            binary_blob,
            '<GPano:FullPanoWidthPixels>',
            '</GPano:FullPanoWidthPixels>'
        ),
        full_pano_height_pixels: getTagFromBinaryStream(
            binary_blob,
            '<GPano:FullPanoHeightPixels>',
            '</GPano:FullPanoHeightPixels>'
        ),
        capture_software: getTagFromBinaryStream(binary_blob, '<GPano:CaptureSoftware>', '</GPano:CaptureSoftware>'),
        stitching_software: getTagFromBinaryStream(
            binary_blob,
            '<GPano:StitchingSoftware>',
            '</GPano:StitchingSoftware>'
        ),
        initial_view_heading_degrees: getTagFromBinaryStream(
            binary_blob,
            '<GPano:InitialViewHeadingDegrees>',
            '</GPano:InitialViewHeadingDegrees>'
        ),
        first_photodate: getTagFromBinaryStream(binary_blob, '<GPano:FirstPhotoDate>', '</GPano:FirstPhotoDate>'),
        last_photodate: getTagFromBinaryStream(binary_blob, '<GPano:LastPhotoDate>', '</GPano:LastPhotoDate>'),
        sl_pano_version: getTagFromBinaryStream(binary_blob, '<SLPanoVersion>', '</SLPanoVersion>'),
        actual_source_cubemap_size_pixels: getTagFromBinaryStream(
            binary_blob,
            '<ActualSourceCubeMapSizePixels>',
            '</ActualSourceCubeMapSizePixels>'
        ),
        scaled_source_cubemap_size_pixels: getTagFromBinaryStream(
            binary_blob,
            '<ScaledSourceCubeMapSizePixels>',
            '</ScaledSourceCubeMapSizePixels>'
        ),
        sl_region_name: getTagFromBinaryStream(binary_blob, '<SLRegionName>', '</SLRegionName>'),
        sl_region_url: getTagFromBinaryStream(binary_blob, '<SLRegionURL>', '</SLRegionURL>'),
    };
}

// we read the initial heading XMP tag from the image and if it's
// set, we use it to roate the camera to the right place
function update_camera(tags) {
    let initial_view_heading_rad = tags.initial_view_heading_degrees * (Math.PI / 180.0);

    // initial direction the camera faces
    // We cannot edit camera rotation directly as the OrbitControls will
    // immediately reset it so we need some math to tell the controls
    // what to look at initially. Note there is also an offset of π/2 since
    // the Viewer and three.js have slightly different coordinate systems
    var spherical_target = new THREE.Spherical(1, Math.PI / 2, initial_view_heading_rad - Math.PI / 2);
    var target = new THREE.Vector3().setFromSpherical(spherical_target);

    camera.position.set(target.x, target.y, target.z);
    controls.update();
    if (controls.saveState != undefined) {
        controls.saveState();
    }
}

// display a tag value as 'undefined' if it's not present
function tag_display(tag) {
    if (tag.length > 0) {
        return '<span style="color:#9f9">' + tag + '</span>';
    } else {
        return '<span style="color:#fa9">undefined</span>';
    }
}

// For now, all the settings draw contains is a list of XMP data tags.
// Likely to be extended in the future, with buttons, sliders etc.
// but for now, just a simple table.
function update_settings_display(tags) {
    let html = '';
    html += '<table width="100%">';
    html += '<th><td class="tbl_heading">XMP metadata</td></th>';
    html += '<tr>';
    html += '<td class="tbl_name">ProjectionType</td><td>' + tag_display(tags.projection_type) + '</td>';
    html += '<td class="tbl_name">UsePanoramaViewer</td><td>' + tag_display(tags.use_panorama_viewer) + '</td>';
    html += '</tr>';
    html += '<tr>';
    html += '<td class="tbl_name">FullPanoWidthPixels</td><td>' + tag_display(tags.full_pano_width_pixels) + '</td>';
    html += '<td class="tbl_name">FullPanoHeightPixels</td><td>' + tag_display(tags.full_pano_height_pixels) + '</td>';
    html += '</tr>';
    html += '<tr>';
    html += '<td class="tbl_name">CaptureSoftware</td><td>' + tag_display(tags.capture_software) + '</td>';
    html += '<td class="tbl_name">StitchingSoftware</td><td>' + tag_display(tags.stitching_software) + '</td>';
    html += '</tr>';
    html += '<tr>';
    html +=
        '<td class="tbl_name">InitialViewHeadingDegrees</td><td>' +
        tag_display(tags.initial_view_heading_degrees) +
        '</td>';
    html += '<td class="tbl_name">FirstPhotoDate</td><td>' + tag_display(tags.first_photodate) + '</td>';
    html += '</tr>';
    html += '<tr>';
    html += '<td class="tbl_name">LastPhotoDate</td><td>' + tag_display(tags.last_photodate) + '</td>';
    html += '<td class="tbl_name">SLPanoVersion</td><td>' + tag_display(tags.sl_pano_version) + '</td>';
    html += '</tr>';
    html += '<tr>';
    html +=
        '<td class="tbl_name">ActualSourceCubeMapSizePixels</td><td>' +
        tag_display(tags.actual_source_cubemap_size_pixels) +
        '</td>';
    html +=
        '<td class="tbl_name">ScaledSourceCubeMapSizePixels</td><td>' +
        tag_display(tags.scaled_source_cubemap_size_pixels) +
        '</td>';
    html += '</tr>';
    html += '<tr>';
    html += '<td class="tbl_name">SLRegionName</td><td>' + tag_display(tags.sl_region_name) + '</td>';
    html += '<td class="tbl_name">SLRegionURL</td><td>' + tag_display(tags.sl_region_url) + '</td>';
    html += '</tr>';
    html += '</table>';

    var elem = document.getElementById('settings_content');
    elem.innerHTML = html;
}

// update the title at the top of the page and add a link
// the to Second Life URL for the region if present. This means
// you can use this page to display a Second Life 360 and if you
// like what you see, click on the icon in the title to directly
// visit that location within the Second Life region.
function update_title(tags) {
    if (tags.sl_region_name.length) {
        var title_text = document.getElementById('title_text_div');
        title_text.innerHTML = tags.sl_region_name;

        document.title = tags.sl_region_name;

        if (!settings.is_mobile) {
            var title_link = document.getElementById('title_link');
            if (title_link) {
                if (tags.sl_region_url.length > 0) {
                    title_link.setAttribute('href', tags.sl_region_url);
                } else {
                    title_link.setAttribute('href', '');
                }
            }
        }

        show_div('title_div', true);
    } else {
        show_div('title_div', false);
    }
}

// This code is an easter egg and a little bit of fun. Turn it on
// by adding egg=1|true|y to the list of URL parameters and smile :)
// Has no relevance or importance to the rest of the code...
var egg_material;
function egg_init() {
    egg_material = new THREE.MeshLambertMaterial();
    var egg_geometry = new THREE.SphereBufferGeometry(0.3, 32, 32);
    egg_geometry.scale(1.0, 1.4, 1.0);
    for (var i = 0; i < 500; ++i) {
        var egg_mesh = new THREE.Mesh(egg_geometry, egg_material);
        egg_mesh.position.z = Math.random() * 16.0 - 8.0;
        scene.add(egg_mesh);
    }
}
function egg_new_pano(texture) {
    egg_material.envMap = texture;
    egg_material.needsUpdate = true;
}
function egg_animate() {
    var elapsed = Date.now() * 0.00025;
    var offset = 1.33;

    for (var i = 0; i < scene.children.length; i++) {
        scene.children[i].position.x = 4 * Math.cos(elapsed + i);
        scene.children[i].position.y = 4 * Math.sin(elapsed + i * offset);
    }
}
