; (function () 
{

  var dbName = 'log-vanillajs';
  var savedFileEntry, fileDisplayPath;

  function getLogAsText(callback)
  {

  }

  function exportToFileEntry(fileEntry) {
  savedFileEntry = fileEntry;

  var status = document.getElementById('status');

  // Use this to get a file path appropriate for displaying
  chrome.fileSystem.getDisplayPath(fileEntry, function(path) {
    fileDisplayPath = path;
    status.innerText = 'Exporting to '+path;
  });





    fileEntry.createWriter(function(fileWriter) {

      var truncated = false;
      

     var blob = new Blob([document.getElementById("mainConsole").innerHTML], {type : "text/plain"});



      fileWriter.onwriteend = function(e) {
        if (!truncated) {
          truncated = true;
          // You need to explicitly set the file size to truncate
          // any content that might have been there before
          this.truncate(blob.size);
          return;
        }
        status.innerText = 'Export to '+fileDisplayPath+' completed';
      };

      fileWriter.onerror = function(e) {
        status.innerText = 'Export failed: '+e.toString();
      };

      fileWriter.write(blob);

    });

}
 function doExportToDisk() {

  if (savedFileEntry) {

    exportToFileEntry(savedFileEntry);

  } else {

    chrome.fileSystem.chooseEntry( {
      type: 'saveFile',
      suggestedName: 'log.csv',
      accepts: [ { description: 'Comma Seperated Values (*.csv)',
                   extensions: ['csv']} ],
      acceptsAllTypes: true
    }, exportToFileEntry);

  }
}

  document.getElementById('exportToDisk').addEventListener('click', doExportToDisk);


  function CTC() {

    // A collection of the GUI elements
    this.port      = document.getElementById('port-selection');
    //this.baudSelection     = document.getElementById('baud-selection');
    this.connect   = document.getElementById('port-connect');
    this.setupPanelLink   = document.getElementById('setupPanelLink');
    
    this.ycenterRange = document.getElementById('ycenterRange');
    this.clearButton = document.getElementById('clearButton');
   // this.stopSweep = document.getElementById('stopSweep');
    this.startSweep = document.getElementById('startSweep');
    this.servoSpeed = document.getElementById('servoSpeed');
    
    this.sendDataButton = document.getElementById('sendData');

    this.dataInSelection = document.getElementById('dataIn');
    this.mainConsole = document.getElementById('mainConsole');

    //this.dataOutSelection = document.getElementById('dataOut');
    //this.convertInput = document.getElementById('convertInput');
    
    //this.buadRate = document.getElementById('baud-selection').value;
    


    this.xcenterRange = document.getElementById('xcenterRange');
    this.idnumber      = document.getElementById('idnumber');
    this.sendPacket      = document.getElementById('sendPacket');
   
    this.instructionSelection      = document.getElementById('instructionSelection');
   
   
    this.d1 = document.getElementById('d1');

    this.d2 = document.getElementById('d2');
    this.d3 = document.getElementById('d3');
    this.d4 = document.getElementById('d4');
    this.button = document.getElementById('button');
    this.instruction = document.getElementById('instruction');
    
    
    
	this.oldInstruction = 'inst0';

    

    // Stats variables
    this.updatingConnection = false;
    this.connection         = null;
    this.connected = false;
    

    this.singleBuffer = new Uint8Array(1);

    this.buffer = new Uint8Array(9);


    // Start up functions
    this.updatePorts();
    this.attachEvents();// 
//     this.myTimer();


	// this.dataInType = 0;//ascii
	// this.dataOutType = 0;//ascii


    
  }

  // Ensures the constructor is set correctly
  CTC.prototype.constructor = CTC;

  ////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////

  CTC.ArduinoConnection = 
  {

    //bitrate:    this.buadRate,
    bitrate:    9600,
    dataBits:   "eight",
    parityBit:  "no",
    stopBits:   "one"
  };

  ////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////

  CTC.prototype.updatePorts = function() 
  {

    // A reference to the CTC object for use in callbacks
    var self = this;
	getDevices = chrome.serial.getDevices || chrome.serial.getPorts;


    // Ask Chrome to find any serial devices
    getDevices(function (ports) {

      // Go through each device, last to first, since the last port will probably be the latest added
      ports.reverse().forEach(function (port) {

        // Create a new option element
        var option = document.createElement('option');

        // Set the elements properties
        option.innerHTML = port.path;
        option.value = port.path;

        // Add it to the select box
        self.port.appendChild(option);

      }); // END forEach

    }); // END getDevices

  };
  
//   CTC.prototype.myTimer = function()
//   {
// 
// 
//       
//    var self = this;
// 
//  
//  	
//     var d = new Date();
//     
//     document.getElementById("hertbeatbeat").value = d.toLocaleTimeString();
//     document.getElementById("dec1").innerHTML = d.toLocaleTimeString();
//     
// 
// 
// 
//   
//   };



	CTC.prototype.sendAscii= function(byteVal)
	{
		var serialOutString = document.getElementById('serialOut').value;
			//console.log(serialOutString);
		var serialOutArray = serialOutString.split("");
			//console.log(serialOutArray[0]);
		var bufferOut = new Uint8Array(serialOutArray.length);

		for(j = 0; j <serialOutArray.length; j++)
		{

			bufferOut[j] = serialOutArray[j].charCodeAt();

			//console.log(bufferOut[j]);
		}
	 		this.transmit(bufferOut);


	}
	

	CTC.prototype.sendDecimal= function(byteVal)
	{
		var serialOutString = document.getElementById('serialOut').value;
			//console.log(serialOutString);
		var serialOutArray = serialOutString.split(" ");
			//console.log(serialOutArray[0]);
		var bufferOut = new Uint8Array(serialOutArray.length);

		for(j = 0; j <serialOutArray.length; j++)
		{

			bufferOut[j] = parseInt(serialOutArray[j]);

			//console.log(bufferOut[j]);
		}
	 		this.transmit(bufferOut);
	}
	

	CTC.prototype.sendHex= function(byteVal)
	{
	 	var serialOutString = document.getElementById('serialOut').value;
			//console.log(serialOutString);
		var serialOutArray = serialOutString.split(" ");
			//console.log(serialOutArray[0]);
		var bufferOut = new Uint8Array(serialOutArray.length);

		for(j = 0; j <serialOutArray.length; j++)
		{
			var tempBuffer;
			tempBuffer = serialOutArray[j].replace("0x", "");
			tempBuffer = tempBuffer.replace("0X", "");

			tempBuffer = "0x" + tempBuffer;

			bufferOut[j] = parseInt(tempBuffer);

			//console.log(bufferOut[j]);
		}
	 		this.transmit(bufferOut);

	}



	CTC.prototype.sendByte= function(byteVal)
	{

		var serialOutString = document.getElementById('serialOut').value;
			//console.log(serialOutString);
		var serialOutArray = serialOutString.split(" ");
			//console.log(serialOutArray[0]);
		var bufferOut = new Uint8Array(serialOutArray.length);

		for(j = 0; j <serialOutArray.length; j++)
		{

			bufferOut[j] = parseInt(serialOutArray[j]);

			//console.log(bufferOut[j]);
		}
	 		this.transmit(bufferOut);

	    //this.singleBuffer[0] = (d1);


	}


  
   CTC.prototype.sendCommanderPacket =  function(pan, tilt, button,ext)
  {

    
        //
//	document.getElementById("packet").innerHTML= "rawr" ;
  
  
  
    this.buffer[0] = parseInt(0xff);
    this.buffer[1] =  parseInt((pan >> 8)& 0xff);
    this.buffer[2] = parseInt(pan & 0xff);
    this.buffer[3] =  parseInt((tilt >> 8)& 0xff);
    this.buffer[4] = parseInt(tilt & 0xff);
    this.buffer[5] = parseInt(button & 0xff);
    this.buffer[6] = parseInt(ext);

    this.buffer[7] = 255-(( this.buffer[1] +  this.buffer[2] +  this.buffer[3] +  this.buffer[4] + this.buffer[5] + this.buffer[6] )%256);


 

 	this.transmit(this.buffer);
    
    
    
    
  };


  
  
  CTC.prototype.attachEvents = function() 
  {

    // A reference to the CTC object for use in callbacks
    var self = this;


    var buffer = new Uint8Array(9);


    // Connects to the selected port
    self.connect.addEventListener('click', function () 
    {
      self.updateConnection();
    });


 //    self.setupPanelLink.addEventListener('click', function () 
 //    {
 //    	if(document.getElementById('setup').style.display == "none")
 //    	{
	// 		document.getElementById('setup').style.display = 'block';
 //    	}
 //    	else
 //    	{	
	// 		document.getElementById('setup').style.display = 'none';
	// 	}
		
		
	// canvasHeight = window.innerHeight - document.getElementById("setup").offsetHeight - document.getElementById("toggle").offsetHeight- document.getElementById("header").offsetHeight -40;
 //   	canvasWidth = window.innerWidth - 20;
	
	
 //    centerY = canvasHeight/2;
 //    centerX = canvasWidth/2;
 //    document.getElementById("ycenterRange").value =centerY;
 //    document.getElementById("xcenterRange").value =centerX;
    



 //    });
    
    
    
  //   self.ycenterRange.addEventListener('input', function () 
  //   {
  //   	console.log(document.getElementById('ycenterRange').value);
  //   	centerY = parseInt(document.getElementById('ycenterRange').value);

	
		// ctx.fillStyle="#FFFFFF";
		// ctx.fillRect(0,0,canvasWidth, canvasHeight);
		
			



  //   });
    
    
  //   self.xcenterRange.addEventListener('input', function () 
  //   {
  //   	centerX = parseInt(document.getElementById('xcenterRange').value);

	
		// ctx.fillStyle="#FFFFFF";
		// ctx.fillRect(0,0,canvasWidth, canvasHeight);
		


  //   });
    
    self.clearButton.addEventListener('click', function () 
    {
    	
		console.log("clear");
		mainConsole.innerHTML = "";



    });
    
    

    self.sendDataButton.addEventListener('click', function () 
    {
    	//console.log(self.dataInType);

    	// if(self.dataInType == 0)
    	// {
    	// 	//console.log("ASCII");
    	// 	//self.sendByte(254);
    	// 	self.sendAscii();
    	// }
    	// else if(self.dataInType == 1)
    	// {
    	// 	//console.log("Decimal");
    	// 	//self.sendByte(254);
    	// 	self.sendDecimal();
    	// }
    	// else if(self.dataInType == 2)
    	// {
    	// 	//console.log("Hex");
    	// 	//self.sendByte(254);
    	// 	self.sendHex();
    	// }
    	// else
    	// {
    	// 	//console.log("noType");

    	// }
    	//self.sendByte(254);
	});


 //    self.baudSelection.addEventListener('change', function () 
 //    {
 //      console.log("CHANGE BAUD");
 //      CTC.ArduinoConnection = 
	//   {
 //      //bitrate:    parseInt(this.value),
 //      bitrate:    38400,
	//     dataBits:   "eight",
	//     parityBit:  "no",
	//     stopBits:   "one"
	//   };	


	// });



    self.dataInSelection.addEventListener('change', function () 
    {

    	if(self.convertInput.checked == true)
    	{
			var serialInString = mainConsole.innerHTML;
			mainConsole.innerHTML = "";

    // 		if(self.dataInType == 0)
    // 		{
				// 	//console.log(serialOutString);
				// var serialInArray = serialInString.split("");
    // 			//check current value of drop down
    // 			if(this.value ==1)
    // 			{
				// 	for(j = 0; j <serialInArray.length; j++)
				// 	{
				// 		mainConsole.innerHTML = mainConsole.innerHTML + " " + serialInArray[j].charCodeAt().toString(10);
				// 	}   				
    // 			}

    // 			else if(this.value ==2)
    // 			{
				// 	for(j = 0; j <serialInArray.length; j++)
				// 	{
				// 		mainConsole.innerHTML = mainConsole.innerHTML + " 0x" + serialInArray[j].charCodeAt().toString(16);
				// 	}   		
    				
    // 			}

    // 		}
    // 		else if(self.dataInType == 1)
    // 		{
				// var serialInArray = serialInString.trim().split(" ");
				// console.log(serialInString);
				// console.log(serialInArray);

    // 			if(this.value ==0)
    // 			{
				// 	for(j = 0; j <serialInArray.length; j++)
				// 	{
				// 		mainConsole.innerHTML = mainConsole.innerHTML + String.fromCharCode(serialInArray[j]);
				// 	}   				
    // 			}

    // 			else if(this.value ==2)
    // 			{
				// 	for(j = 0; j <serialInArray.length; j++)
				// 	{
				// 		console.log("t");
				// 		console.log(j);
				// 		console.log(serialInArray[j]);
				// 		console.log(serialInArray[j].toString(16));

				// 		mainConsole.innerHTML = mainConsole.innerHTML + " 0x" + parseInt(serialInArray[j]).toString(16);
				// 	}   		
    				
    // 			}

    // 		}
    // 		else if(self.dataInType == 2)
    // 		{
				// var serialInArray = serialInString.trim().split(" ");
    // 			if(this.value ==0)
    // 			{
				// 	for(j = 0; j <serialInArray.length; j++)
				// 	{
				// 		mainConsole.innerHTML = mainConsole.innerHTML  + String.fromCharCode(serialInArray[j]);
				// 	}   				
    // 			}

    // 			else if(this.value ==1)
    // 			{
				// 	for(j = 0; j <serialInArray.length; j++)
				// 	{
				// 		mainConsole.innerHTML = mainConsole.innerHTML + " " + parseInt(serialInArray[j]).toString(10);
				// 	}   		
    				
    // 			}

    // 		}


				//mainConsole.innerHTML = mainConsole.innerHTML + " " + serialInBuffer[j].toString(10);
				//mainConsole.innerHTML = mainConsole.innerHTML + " " + "0x" + serialInBuffer[j].toString(16).toUpperCase();


    	}


    	// self.dataInType = this.value;
    	// console.log(self.dataInType);

    	//if()
	});


 //    self.dataOutSelection.addEventListener('change', function () 
 //    {
 //    	self.dataInType = this.value;
	// });

 //    self.convertInput.addEventListener('change', function () 
 //    {
 //    	//if( this.value;

	// });





   //  self.startSweep.addEventListener('click', function () 
   //  {
    
   //  	if(scanning == 0)
   //  	{
   //  		self.startSweep.innerHTML = "Stop Scanning";
			// self.sendCommanderPacket(0,0,0,1);
			// scanning = 1;
   //  	}
   //  	else
   //  	{
   //  		self.startSweep.innerHTML = "Start Scanning";
			// self.sendCommanderPacket(0,0,0,2);
			// scanning = 0;
    	
   //  	}
   //  	//send '1' extended instruction to start
    	


   //  });
    /*
    
    self.stopSweep.addEventListener('click', function () 
    {
    	
    	//send '2' extended instruction to stop
		self.sendCommanderPacket(0,0,0,2);
		console.log("test sweep stop");	


    });*/
  //   self.servoSpeed.addEventListener('change', function () 
  //   {
    	
  //   	//send '3' extended instruction to set speed value from pan bytes
		// console.log("test sevo speed1");	
		// self.sendCommanderPacket(parseInt(self.servoSpeed.value),0,0,3);
		// console.log("test sevo speed");	
		// console.log(self.servoSpeed.value);


  //   });
    
    
    
    
    
    self.connect.addEventListener('click', function () 
    {
      self.updateConnection();
    });
    


	// self.instructionSelection.addEventListener('change', function () 
	// {
	// 	//clear space		
	// 	var list = document.getElementsByClassName("inst");
	// 	for (var i = 0; i < list.length; i++) {
	// 		 list[i].style.display = "none";
	// 	}
		
	// 	//show intended part.
	// 	document.getElementById(document.getElementById('instructionSelection').value).style.display = "block";
		
		

		
	// });






  };
        


  

  

  CTC.prototype.updateConnection = function() {

    // A reference to the CTC object for use in callbacks
    var self = this;

    // Prevent the function from firing more than once
    if (self.updatingConnection) {
      return;
    }

    // Lock the function
    self.updatingConnection = true;

    // If a connection isn't made, then make one.
    if (!self.connection) {
		self.connected = true;
      // Update the status text
      self.connect.classList.add('disabled');
      self.connect.innerHTML = 'Connecting...';
      
      //CTC.buadRate = document.getElementById('baud-selection').value;

      console.log("update conn") ;
      
// console.log(CTC.buadRate) ;
// console.log(CTC.ArduinoConnection) ;
      // Ask chrome to create a connection
      chrome.serial.connect(self.port.value, CTC.ArduinoConnection, function (info) {

        // Store the connection
        self.connection = info;
        
        //chrome.serial.onReceive.addListener(onReceiveCallback);


        // Unlock the function
        self.updatingConnection = false;

        // Update the status text
        self.connect.classList.remove('disabled');
        self.connect.innerHTML = 'Disconnect';
        
        
		//ctx.fillStyle="#FFFFFF";
		//ctx.fillRect(0,0,canvasWidth, canvasHeight);
		


 		chrome.serial.onReceive.addListener(readHandler);


  			//document.getElementById("datadata").innerHTML = "add listener";
  			
  console.log( "ADDL:" );
      });

    // If there is already a connection, destroy it.
    } else {

		self.connected = false;
      // Update the status text
      self.connect.classList.add('disabled');
      self.connect.innerHTML = 'Disconnecting...';


      // Ask Chrome to close the connection
      chrome.serial.disconnect(self.connection.connectionId, function (result) {

        chrome.serial.onReceive.removeListener(readHandler)

        // Clear the stored connection information
        self.connection = null;

        // Unlock the function
        self.updatingConnection = false;

        // Update the status text
        self.connect.classList.remove('disabled');
        self.connect.innerHTML = 'Connect';

      });

    }


  };

  CTC.prototype.transmit = function(buffer) {

    // A reference to the CTC object for use in callbacks
    var self = this;


   //  // Chrome's serial API expects data to be sent as a data buffer.

   //  // Sets the data in the buffer
   // // buffer[0] = action ? 1 : 0;

   //  var buffer = new Uint8Array(17);
 		// buffer[0] = 0xff;
 		// buffer[1] = 0x00;
 		// buffer[2] = 0x00;
 		// buffer[3] = 0x00;
 		// buffer[4] = 0x00;
 		// buffer[5] = 0x00;
 		// buffer[6] = 0x00;
 		// buffer[7] = 0x00;
 		// buffer[8] = 0x00;
 		// buffer[9] = 0x00;
 		// buffer[10] = 0x00;
 		// buffer[11] = 0x00;
 		// buffer[12] = 0x00;
 		// buffer[13] = 0x00;
 		// buffer[14] = 0x00;
 		// buffer[15] = 0x40;
 		// buffer[16] = 0xBF;




    // Transmit the data to the Arduino
    chrome.serial.send(self.connection.connectionId, buffer.buffer, function (sendInfo) {});

  };

  document.addEventListener('DOMContentLoaded', function () {

    // Start the CTC class
    window.CTC = new CTC();

  });

})();
//Keep in mind that processing the buffer may lag behind the buffer itself, so consloe.logs might be out of sync between what you see in the buffer and what's been processed



var connectionIdExt;
var responsePacketData = new Uint8Array(7);
var responsePacketDataIndex = -1;
var lastByteTime;
var newPacket = 0;
//there's a big here  - responsePacketDataIndex ios getting bigger than 6( its 12) probably a timing bug

var serialBuffer = [0];
var serialIndex = -1;
var packetsReceived = 0;
       


var readHandler = function(info)
{


		console.log("ASCII in");

	// if(dataInType == 0)
	// {
		//console.log("ASCII in");

		var serialInBuffer = (new Uint8Array(info.data));
		var mainConsole = document.getElementById("mainConsole");

        console.log(mainConsole);

		for(j = 0; j < serialInBuffer.length; j++)
		{
			//	mainConsole.innerHTML = mainConsole.innerHTML + " " + serialInBuffer[j];
				var tempBuffer =  serialInBuffer[j];
        
        var tempoBuffer =  "" + serialInBuffer[j] + " ";
        
        if (serialInBuffer[j] == 0x0A)
        {

          var d = new Date();
         //var dateString = d.toDateString();
         //var time = d.toLocaleTimeString();
         var time = d.toString();
         var minutes =("0" + d.getMinutes()).substr(-2); // leading 0 for minutes
         var seconds =("0" + d.getSeconds()).substr(-2); // leading 0 for minutes
      


         var dateTime = d.getDate() + "/" + d.getMonth() + "/" + d.getFullYear() + " " + d.getHours() + ":" + minutes + ":" + seconds;


          mainConsole.innerHTML = mainConsole.innerHTML + "," + dateTime  +   String.fromCharCode( serialInBuffer[j]);
        }
        else
        {
          mainConsole.innerHTML = mainConsole.innerHTML +   String.fromCharCode( serialInBuffer[j]);
        }

				
				console.log(tempoBuffer);
				//mainConsole.innerHTML = mainConsole.innerHTML + " " +  String.valueOf(tempBuffer ) .charCodeAt(0);
				
				// /mainConsole.innerHTML = mainConsole.innerHTML + " " +  tempoBuffer.charCodeAt(0);

        mainConsole.scrollTop = mainConsole.scrollHeight;  

		}




	// }
	// else if(dataInType == 1)
	// {
	// 	console.log("Decimal in");
	// 	var serialInBuffer = (new Uint8Array(info.data));
	// 	var mainConsole = document.getElementById("mainConsole");

	// 	for(j = 0; j < serialInBuffer.length; j++)
	// 	{
	// 		//	mainConsole.innerHTML = mainConsole.innerHTML + " " + serialInBuffer[j];
	// 			mainConsole.innerHTML = mainConsole.innerHTML + " " + serialInBuffer[j].toString(10);


	// 	}
	// }
	// else if(dataInType == 2)
	// {

	// console.log("Hex in");
	// 	var serialInBuffer = (new Uint8Array(info.data));
	// 	var mainConsole = document.getElementById("mainConsole");

	// 	for(j = 0; j < serialInBuffer.length; j++)
	// 	{
	// 		//	mainConsole.innerHTML = mainConsole.innerHTML + " " + serialInBuffer[j];
	// 			mainConsole.innerHTML = mainConsole.innerHTML + " " + "0x" + serialInBuffer[j].toString(16).toUpperCase();

	// 	}

	// }
	// else
	// {
	// 	console.log("noType");

	// }






}

        		
var readHandlers = function(info) 
{

//console.log("Read!");
	var tempResponsePacketData = (new Uint8Array(info.data));
	for(j = 0; j < tempResponsePacketData.length; j++)
	{
			
//		serialBuffer[serialIndex] = ;
		serialBuffer.push(tempResponsePacketData[j]);
		serialIndex = serialIndex + 1;
	}
	
	
	
	
	

//console.log("Read1!---------------------------");	
	for(j = 0; j < serialBuffer.length; j++)
	{
			
//		serialBuffer[serialIndex] = ;
		//console.log(serialBuffer[j]);
	}
	


	while(serialIndex >= 0)
	{
	
		if(responsePacketDataIndex == -1  )
		{
		
			if(serialBuffer[0] == 255)
			{
					
			//console.log("START PACKET!---------------------------");	
				responsePacketDataIndex = 0;
				responsePacketData[responsePacketDataIndex] = serialBuffer.shift(); //put first element  from serialBuffer into response packet and shift the array
				serialIndex = serialIndex - 1;
			}
			else
			{
				serialBuffer.shift();		
				serialIndex = serialIndex - 1;
			}
		}
	
		else if(responsePacketDataIndex == 0  )
		{
		
			if(serialBuffer[0] == 255)
			{
				//console.log("SECOND BYTE PACKET!---------------------------");	
				
				
				responsePacketDataIndex = 1;
				responsePacketData[responsePacketDataIndex] = serialBuffer.shift(); //put first element  from serialBuffer into response packet and shift the array
				serialIndex = serialIndex - 1;
			}
			else
			{
				serialBuffer.shift();
				serialIndex = serialIndex - 1;
			}
		
		}
		
		else if(responsePacketDataIndex == 5  )
		{
		
	//		
			
			responsePacketDataIndex = responsePacketDataIndex + 1;
			responsePacketData[responsePacketDataIndex] = serialBuffer.shift();
			serialIndex = serialIndex - 1;
			
			
			var checksum = 255 - ((responsePacketData[2] + responsePacketData[3] + responsePacketData[4] + responsePacketData[5] )%256);
			
			//console.log("checksum");
			//console.log(checksum);
			//console.log(responsePacketData[6]);
			
			if (checksum == responsePacketData[6])
			{
				
			
			}
			else
			{
				responsePacketDataIndex = -1;
				//console.log("--------CHECK SUM ERROR -------");
			}
				//serialBuffer.shift();
				//serialIndex = serialIndex - 1;
		
		
		}
	
		else if(responsePacketDataIndex > 6)
		{
				responsePacketDataIndex = -1;
		
				//console.log("--------RESET? -------");
		}
	
	
		else
		{
//console.log("Readelseess1.5!");	
//console.log(responsePacketDataIndex);

			responsePacketDataIndex = responsePacketDataIndex + 1;
			responsePacketData[responsePacketDataIndex] = serialBuffer.shift();
			serialIndex = serialIndex - 1;
		}
		
		
		
		
		if(responsePacketDataIndex == 6)
		{
			packetsReceived = packetsReceived + 1;
			//console.log("---SUCCESS----------");
			/*
			document.getElementById("packetsReceived").innerHTML = packetsReceived;
			
		  	//console.log("---SUCCESS----------");
	
			document.getElementById("resp0h").innerHTML = "0x" + responsePacketData[0].toString(16).toUpperCase();
			document.getElementById("resp1h").innerHTML = "0x" + responsePacketData[1].toString(16).toUpperCase();
			document.getElementById("resp2h").innerHTML = "0x" + responsePacketData[2].toString(16).toUpperCase();
			document.getElementById("resp3h").innerHTML = "0x" + responsePacketData[3].toString(16).toUpperCase();
			document.getElementById("resp4h").innerHTML = "0x" + responsePacketData[4].toString(16).toUpperCase();
			document.getElementById("resp5h").innerHTML = "0x" + responsePacketData[5].toString(16).toUpperCase();
			document.getElementById("resp6h").innerHTML = "0x" + responsePacketData[6].toString(16).toUpperCase();
			document.getElementById("resp0l").innerHTML = twoBytesTogether;
			*/
			//console.log("---ararSUCCESS----------");
			var twoBytesTogether = (responsePacketData[2] << 8) + (responsePacketData[3]);
			var degree = (twoBytesTogether / 4095) * 360;
				//console.log("Degree :" + degree);
			if(degree <= 360 && degree >=0)
			{
				document.getElementById("resp0lconverted").innerHTML = degree;
				//console.log("ERRORR");
				//console.log(degree);
				//console.log(responsePacketData[0] + " " +responsePacketData[1] + " " +responsePacketData[1] + " " +responsePacketData[3] + " " +responsePacketData[4] + " " +responsePacketData[5] + " " +responsePacketData[6] + " " );
				
				twoBytesTogether = (responsePacketData[4] << 8) + (responsePacketData[5]);
				document.getElementById("resp02").innerHTML = twoBytesTogether;
				
				var distance = twoBytesTogether;
				var maxDistance = document.getElementById("maxDistance").value;
				
				
				//find the smallest, canvas height or width, and use that as an upper bound
				if(canvasHeight < canvasWidth)
				{
				
					distance = (distance / maxDistance) * (canvasHeight/2);
				}
				else
				{
				
					distance = (distance / maxDistance) * (canvasWidth/2);
				
				}
				
				
				
				document.getElementById("resp02converted").innerHTML = distance;
			
			
				responsePacketDataIndex = -1;
				degree = 360 - degree;
				drawPoint(degree,distance );
				
				//console.log("Degree mapped:" + degree);
			}
			
			if(degree >lastDegree)
			{
				direction = 0;//0 is ccw
			}
			else
			{
				direction = 1;//1 is cw
			}
			
			if(document.getElementById('clearOnSweep').checked == true)
			{
				//if direction has changed, call draw() to clear canvas
				if (direction != lastDirection)
				{

				}
			}			
			
			
			
			
			lastDegree = degree;
			lastDirection = direction;
			
			
	
		
		}
	
	
	}
		
	
	

	
  
  
};
	var lastDegree;
	var direction;
	var lastDirection
	var canvas = document.getElementById('canvasRoom');
	var ctx;
	
	var r = 200.0;
	//var centerX = document.getElementById('xcenterRange').value;
	//var centerY  = document.getElementById('ycenterRange').value;
	var lastX = 750;
	var lastY = 750;
	
	//var canvasHeight = window.innerHeight - document.getElementById("setup").offsetHeight - document.getElementById("toggle").offsetHeight- document.getElementById("header").offsetHeight -40;
   
	//var canvasWidth = window.innerWidth - 20;
	
	//var scanning = 0;    
   
function drawPoint(degree, distance)
{
	//console.log("fill2");
	
	//console.log(document.getElementById('xcenterRange').value);
     	if (canvas.getContext) 
     	{
        	//var ctx = canvas.getContext("2d");
			tempR =  distance ;
				//console.log(tempR);
				var x = tempR * Math.cos(toRadians(degree));
				var y = tempR * Math.sin(toRadians(degree));
				//console.log(x);
				//console.log(y);
			ctx.fillStyle="#00FF00";

				ctx.fillRect (x+centerX, y+centerY, 5, 5);
				

				
			// 	ctx.fillRect (x, y2, 5, 5);
	
	
	//Line drawing only draw lines if requested
	if(document.getElementById("drawLines").checked == true)
	{
	  ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x+centerX, y+centerY);
      ctx.stroke();
     } 
      lastX = x+centerX;
      lastY = y+centerY;
      
			

	//ctx.fillRect (0, 0, 50, 50);


      	}
      	
			
			


}


function draw()
{
	
	if (canvas.getContext) 
	{
		 ctx = canvas.getContext("2d");
	
	
		ctx.fillStyle="#FFFFFF";
		ctx.fillRect(0,0,canvasWidth,canvasHeight);
		//ctx.fillRect(0,0,1000,500);
		
		
	ctx.fillStyle="#FF0000";

	ctx.fillRect (centerX-25, centerY-25, 50, 50);
	console.log(centerY);
	
	}
}

function toDegrees (angle) 
{
	return angle * (180 / Math.PI);
}

function toRadians (angle) {
  return angle * (Math.PI / 180);
}






window.onload =  function() {


	mainConsole = document.getElementById("mainConsole");
    terminalWidth = window.innerWidth - 20;
    terminalHeight = window.innerHeight - document.getElementById("setup").offsetHeight -  document.getElementById("header").offsetHeight - 200;
    mainConsole.style.width = terminalWidth + "px";
    mainConsole.style.height = terminalHeight + "px";


    
}
 window.onresize = function() {
 	redrawTerminal();


}

function redrawTerminal()
{

	mainConsole = document.getElementById("mainConsole");
    terminalWidth = window.innerWidth - 20;
    terminalHeight = window.innerHeight - document.getElementById("setup").offsetHeight - document.getElementById("header").offsetHeight  - 200;
    mainConsole.style.width = terminalWidth + "px";
    mainConsole.style.height = terminalHeight + "px";

    
}



