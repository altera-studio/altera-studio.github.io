    // query params
    var uniqueID; 
    var url = new URI();
    
    if(url.query()) {
      uniqueID = url.query();
    }
    else {
      uniqueID = generateSimpleID(7); 
      // append param to url 
      window.history.pushState('' ,'', '?' + uniqueID);
    }

    // firebase configuration
    var config = {
      apiKey: "AIzaSyAZTkQMjsflsNOjQmcApfJM6ZJiS7t6WQA",
      authDomain: "test0db.firebaseapp.overwolf-extension://anoahjhemlbnmhkljlgbmnfflpnhgjpmfjnhdfoe/img/favicon.pngcom",
      databaseURL: "https://test0db.firebaseio.com",
      projectId: "firebase-test0db",
      storageBucket: "firebase-test0db.appspot.com",
      messagingSenderId: "306193635025",
      appId: "1:306193635025:web:872c6287a60251585417f0"
    };

    firebase.initializeApp(config);

    var auth = firebase.auth();
    var database = firebase.database();
    var storage = firebase.storage();

    var room = database.ref('rooms/').child(uniqueID);

    var width = 680;
    var height = 700;
    var painting = true;

    var stage = new Konva.Stage({
      container: 'container',
      width: width,
      height: height,
      id: 'map'
    });
    
    var bgLayer = new Konva.Layer();
    var objLayer = new Konva.Layer();
    stage.add(bgLayer);
    stage.add(objLayer);

    var assetsPath = 'assets/maps/';
    // map images
    var havenMap = assetsPath + 'haven-layout-base.svg';
    var splitMap = assetsPath + 'split-layout-base2.svg';
    var bindMap = assetsPath + 'bind-layout-base.svg';
    // labels 
    var havenAttackLabels = assetsPath + 'haven-labels-offense.svg';
    var havenDefenseLabels = assetsPath + 'haven-labels-defense.svg';
    var splitAttackLabels = assetsPath + 'split-labels-offense2.svg';
    var splitDefenseLabels = assetsPath + 'split-labels-defense2.svg';
    var bindAttackLabels = assetsPath + 'bind-labels-offense.svg';
    var bindDefenseLabels = assetsPath + 'bind-labels-defense.svg';

    // defaults
    mapView = havenMap;
    mapLabels = havenAttackLabels;

    Konva.Image.fromURL(mapView, function(map) {
      map.setAttrs({
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
      });
      bgLayer.add(map);
      bgLayer.batchDraw();
    });

    Konva.Image.fromURL(mapLabels, function(labels) {
      labels.setAttrs({
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
      });
      bgLayer.add(labels);
      bgLayer.batchDraw();
    });

    // get url of dragged icon
    var itemURL = '';
    document.getElementById('drag-items').addEventListener('dragstart', function (e) {
      itemURL = e.target.src;
    });

    var con = stage.container();
    con.addEventListener('dragover', function (e) {
      e.preventDefault(); // !important
    });

    con.addEventListener('drop', function (e) {
      e.preventDefault();
      // now we need to find pointer position
      // we can't use stage.getPointerPosition() here, because that event
      // is not registered by Konva.Stage
      // we can register it manually:
      stage.setPointersPositions(e);

      Konva.Image.fromURL(itemURL, function(image) {
        /* image.setAttrs({
          scaleX: .5,
          scaleY: .5,
        }); */

        // objLayer.add(image);

        // send icon's positional info to database 
        room.child('icons').push({
          x: e.layerX - 18, // subtract half of icon width to center 
          y: e.layerY - 18,
          icon : itemURL
        });

        // [] update position of icon if dragged by anyone 

        image.position(stage.getPointerPosition());
        image.draggable(true);

        objLayer.draw();

        image.on('mouseover mousedown mouseup', function () {
          console.log('don\'t draw!');
          painting = false;
        });

        image.on('mouseout', function () {
          console.log('draw!');
          painting = true;
        });

      });
    });

    room.child('icons').on('child_added', function(data) 
    {
      console.log(data.val().icon);

      Konva.Image.fromURL(data.val().icon, function(icon) {
        icon.setAttrs({
          x: data.val().x,
          y: data.val().y,
          scaleX: .4,
          scaleY: .4,
        });
        objLayer.add(icon);
        objLayer.batchDraw();
      });
    });

    var isPaint = false;
    var arrow;

    stage.on('contentMousedown', function() {
        isPaint = true;
        var pos = stage.getPointerPosition();
        arrow = new Konva.Arrow({   
          points: [pos.x, pos.y, pos.x, pos.y],         
          pointerLength: 14,
          pointerWidth : 14,
          fill: $('span#styleSpan').css('background-color'),
          stroke: $('span#styleSpan').css('background-color'),
          strokeWidth: 2
        });
        objLayer.add(arrow);
    });

    stage.on('contentMouseup', function() {
      isPaint = false;

      var pos = stage.getPointerPosition();
      var oldPoints = arrow.points();

      // add to database once arrow is placed 
      room.child('arrows').push({
          oldX : oldPoints[0],
          oldY :  oldPoints[1],
          x : pos.x,
          y : pos.y,
          color: $('span#styleSpan').css('background-color')
      });
    });

    // and core function - drawing
    stage.on('contentMousemove', function() {
        if (!isPaint) {
            return;
        }

        var pos = stage.getPointerPosition();
        var oldPoints = arrow.points();
        arrow.points([oldPoints[0], oldPoints[1], pos.x, pos.y]);
        objLayer.draw();
    });

    room.child('arrows').on('child_added', function(data) 
    {
      var arr = new Konva.Arrow({   
        points: [data.val().oldX, data.val().oldY, data.val().x, data.val().y],         
        pointerLength: 14,
        pointerWidth : 14,
        fill: data.val().color,
        stroke: data.val().color,
        strokeWidth: 2
      });

      objLayer.add(arr);
      objLayer.batchDraw();
    });

    auth.onAuthStateChanged(function(user) {
      if (user) {
        console.log('User is signed in.');
        // User is signed in.
        var isAnonymous = user.isAnonymous;
        var uid = user.uid;
       
        console.log('uid', uid, ', isAnonymous', isAnonymous);
      
        // BUTTONS
        $(document).find('#reset').click(function() 
        { 
          objLayer.clear();
          room.child('icons').remove();
          room.child('arrows').remove();
        });

        $(document).find('#flip').click(function() 
        {
          objLayer.clear();
          bgLayer.clear();
          room.child('icons').remove();
          room.child('arrows').remove();

          // flip labels
          switch(mapLabels) {
            case havenAttackLabels: mapLabels = havenDefenseLabels; break;
            case havenDefenseLabels: mapLabels = havenAttackLabels; break;
            case splitAttackLabels: mapLabels = splitAttackLabels; break;
            case splitDefenseLabels: mapLabels = splitDefenseLabels; break;
            case bindAttackLabels: mapLabels = bindAttackLabels; break;
            case bindDefenseLabels: mapLabels = bindDefenseLabels; break;
          }

          Konva.Image.fromURL(mapView, function(map) {
            map.setAttrs({
              x: 0,
              y: 0,
              scaleX: 1,
              scaleY: 1,
            });
            bgLayer.add(map);
            bgLayer.batchDraw();
          });

          Konva.Image.fromURL(mapLabels, function(labels) {
            labels.setAttrs({
              x: 8,
              y: 34,
              scaleX: 1,
              scaleY: 1,
            });
            bgLayer.add(labels);
            bgLayer.batchDraw();
          });
        });

        $(document).find('#save').click(function() 
        {
          var bgCanvas = $('.konvajs-content canvas')[0]; 
          var ctx = bgCanvas.getContext('2d');

          // add objects to bgCanvas to save both as one image
          var objCanvas = $('.konvajs-content canvas')[1]; 
          ctx.drawImage(objCanvas, 0, 0);
          var img = bgCanvas.toDataURL('image/png');

          // save to local drive
          img.toBlob(function(blob) {
              saveAs(blob, "pretty image.png");
          });

          // save to cloud implementation 
          /*
          alert('Your strategy has been saved!');
          
          // generate a unique identifier to name the image     
          var uuidv4 = generateUUIDV4();

          // save image under current user's folder by their user id 
          storage.ref('images/' + uid + '/' + uuidv4).putString(img, 'data_url'); 
          */    
        });

        $(document).find('#view').click(function() 
        {
          // retrieve images from storage folder that match user's id
          var storageRef = storage.ref('images/' + uid);

          storageRef.listAll().then(function(result) {
            result.items.forEach(function(imageRef) {
              console.log(imageRef);
            });
          }).catch(function(error) {
            // errors
          });
        });
      } else 
      {
        console.log('User is not signed in! Signing them in now...');
        // User is signed out. [] or not signed in? 
        // ...
        anonymousAuth();
      }
      // ...
    });