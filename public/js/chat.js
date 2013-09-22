var loadData = {
	online_users: [
		{
		    "first_name":"holly",
		    "last_name":"hu",
		    "id":"3",
		    "thumbnail":null,
		    "company_name":"",
		    "location":null,
		    "picture":"http:\/\/localhost\/sanfordi\/images\/picture.jpg",
		    "websites":"",
		    "url":"user\/profile\/view\/3",
		    "full_name":"holly hu"
		},
		{
            "first_name":"holly",
            "last_name":"hua",
            "id":"2",
            "thumbnail":null,
            "company_name":"",
            "location":null,
            "picture":"http:\/\/localhost\/sanfordi\/images\/picture.jpg",
            "websites":"",
            "url":"user\/profile\/view\/3",
            "full_name":"holly hua"
        }
	],
	conversations: {
	   "num_rows":3,
	   "page_num":0,
	   "page_count":1,
	   "page_size":100,
	   "result":[
	      {
	         "id":"3",
	         "subject":"1111111111",
	         "starter_id":"3",
	         "user_id":"1",
	         "last_sent_index":"0",
	         "last_read_index":"0",
	         "join_index":"1",
	         "last_show_index":"0",
	         "index":"1",
	         "messages":{
	            "num_rows":1,
	            "page_num":1,
	            "page_count":1,
	            "page_size":100,
	            "result":[
	               {
	                  "id":"13",
	                  "from_user_id":"3",
	                  "message_conversation_id":"3",
	                  "message":"111111111111",
	                  "sent_time":"2011-01-05 16:13:28",
	                  "index":"1",
	                  "from_user_info":{
	                     "first_name":"holly",
	                     "last_name":"hu",
	                     "id":"3",
	                     "thumbnail":null,
	                     "company_name":"",
	                     "location":null,
	                     "picture":"http:\/\/localhost\/sanfordi\/images\/picture.jpg",
	                     "websites":"",
	                     "url":"user\/profile\/view\/3",
	                     "full_name":"holly hu"
	                  }
	               }
	            ]
	         },
	         "starter":{
	            "first_name":"holly",
	            "last_name":"hu",
	            "id":"3",
	            "thumbnail":null,
	            "company_name":"",
	            "location":null,
	            "picture":"http:\/\/localhost\/sanfordi\/images\/picture.jpg",
	            "websites":"",
	            "url":"user\/profile\/view\/3",
	            "full_name":"holly hu"
	         }
	      },
	      {
	         "id":"2",
	         "subject":"Hi,i'm holly",
	         "starter_id":"3",
	         "user_id":"1",
	         "last_sent_index":"0",
	         "last_read_index":"0",
	         "join_index":"1",
	         "last_show_index":"0",
	         "index":"1",
	         "messages":{
	            "num_rows":2,
	            "page_num":1,
	            "page_count":1,
	            "page_size":100,
	            "result":[
	               {
	                  "id":"11",
	                  "from_user_id":"3",
	                  "message_conversation_id":"2",
	                  "message":"Hello ,kevin",
	                  "sent_time":"2011-01-05 10:46:27",
	                  "index":"1",
	                  "from_user_info":{
	                     "first_name":"holly",
	                     "last_name":"hu",
	                     "id":"3",
	                     "thumbnail":null,
	                     "company_name":"",
	                     "location":null,
	                     "picture":"http:\/\/localhost\/sanfordi\/images\/picture.jpg",
	                     "websites":"",
	                     "url":"user\/profile\/view\/3",
	                     "full_name":"holly hu"
	                  }
	               },
	               {
	                  "id":"12",
	                  "from_user_id":"1",
	                  "message_conversation_id":"2",
	                  "message":"Write a comment\u2026",
	                  "sent_time":"2011-01-05 13:57:30",
	                  "index":"2",
	                  "from_user_info":{
	                     "first_name":"kevin",
	                     "last_name":"jiang",
	                     "id":"1",
	                     "thumbnail":"jt41.jpg",
	                     "company_name":"Tradesparq Ltd.",
	                     "location":"LA, California, United States",
	                     "picture":"http:\/\/localhost\/sanfordi\/uploads\/jt41.jpg",
	                     "websites":"",
	                     "url":"user\/profile\/view\/1",
	                     "full_name":"kevin jiang"
	                  }
	               }
	            ]
	         },
	         "starter":{
	            "first_name":"holly",
	            "last_name":"hu",
	            "id":"3",
	            "thumbnail":null,
	            "company_name":"",
	            "location":null,
	            "picture":"http:\/\/localhost\/sanfordi\/images\/picture.jpg",
	            "websites":"",
	            "url":"user\/profile\/view\/3",
	            "full_name":"holly hu"
	         }
	      },
	      {
	         "id":"1",
	         "subject":"My first message to william",
	         "starter_id":"1",
	         "user_id":"1",
	         "last_sent_index":"9",
	         "last_read_index":"9",
	         "join_index":"1",
	         "last_show_index":"1",
	         "index":"1",
	         "starter":{
	            "first_name":"kevin",
	            "last_name":"jiang",
	            "id":"1",
	            "thumbnail":"jt41.jpg",
	            "company_name":"Tradesparq Ltd.",
	            "location":"LA, California, United States",
	            "picture":"http:\/\/localhost\/sanfordi\/uploads\/jt41.jpg",
	            "websites":"",
	            "url":"user\/profile\/view\/1",
	            "full_name":"kevin jiang"
	         }
	      }
	   ]
	}
};

$(window).load(function(){
	chat = new Chat();
});

function Chat(options){
	var defaults = {
	};
	
	var settings = $.extend(defaults, options);
	
	this.counter = 0;
	this.statusBox = null;
	this.chatBoxes = {};
	
	var data = loadData; // Replace this to real ajax call later, with error handling
	
	this.createChatStatus(data);
	this.loadChatBoxes(data);
}

Chat.prototype.createChatStatus = function(data){
	if(this.statusBox == null){
		this.statusBox = $('#jtmpl_chatstatus').tmpl(data);
		this.statusBox.appendTo('body');
	}else {
		this.statusBox.replaceWith($('#jtmpl_chatstatus').tmpl(data));
	}
};

Chat.prototype.loadChatBoxes = function(data){
	conversations = data.conversations.result;
	for(var i = 0; i < conversations.length; i++){
		var c = conversations[i];
		if(this.chatBoxes[c.id] == undefined){
			this.createChatBox(c);
		}else {
			alert("existed");
		}
	}
};

Chat.prototype.createChatBox = function(conversation){
	// Find the left most of all chat boxes
	var left = this.statusBox.position().left;
	for(id in this.chatBoxes){
		var position = this.chatBoxes[id].position();
		if(position.left < left) left = position.left; 
	}
	var chatBox = $('#jtmpl_chatbox').tmpl(conversation);
	chatBox.css('right', ($(window).width() - left) + 'px').appendTo('body');
	this.chatBoxes[conversation.id] = chatBox;
};

Chat.prototype.heartBeat = function(){
};