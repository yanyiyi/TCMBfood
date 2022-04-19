// 這個js的引入應該要在flowplay.js引入之後

var _imedia_player_api = null;
var _fp_media_list = [];
var _fp_play_order = [];
var _fp_played_list = [];
var _fp_preview_playlist = [];
var _fp_formal_playlist = [];
var _current_idx = -1;
var _last_idx = -1;
var _current_playlist_type = null;
var _will_play = null;
var _on_error = false;
var _debug = false;
var _fake_url = "https://none/fake.m3u8";
var _fullscreen_btn = null;
var _jq_fp_container = null;
var _timeout = null;
var _loop_all = false;
var _loop_one = false;
var _random_mode = false;
var _st_cue_point = null;
var _end_cue_point = null;


//------------------------- split mode
var _split_mode = false;
//儲存各分段物件
var _split_obj = null;
//記錄現在分段模式在哪一分段
var _split_mode_now_index = null;
//分段模式的call back 變化選單用
var _split_call_back = null;

//播放分段
function playSplit(split_idx){
	
//	console.log("play - > " + split_idx)
	_split_mode = true;
	_split_mode_now_index = split_idx;
	var split_obj = _split_obj[split_idx];
	abPlay(true , split_obj.start , split_obj.end);
	
	if(_split_call_back){
		_split_call_back(split_idx )
	}
	
}

//播放下個分段
function playNextSplit(){
	_split_mode = true;
//	console.log("before - > "+_split_mode_now_index);
	if(_split_mode_now_index != null){
		_split_mode_now_index ++;
		if(_split_mode_now_index == _split_obj.length){
			_split_mode_now_index = 0;
		}
	}else{
		_split_mode_now_index = 0;  
	}
	playSplit(_split_mode_now_index);
}

//給定時間  給予是否在分段內 回傳 true代表這時間不合規定
function checkSplit(t){
	//是否在分段內
	var isInSplit = false;
	//這時間在哪個分段
	var toSplitIdx = 0;
	for(var idx in _split_obj){
		var o = _split_obj[idx];
		var stSec = convertTimeStringToInt(o.start);
		var endSec = convertTimeStringToInt(o.end);
		if(t >= stSec && t <= endSec){
			isInSplit = true;
			toSplitIdx = idx;
			break;
		}
	}
//	console.log(isInSplit);
//	console.log(toSplitIdx);
	if(isInSplit){
		var o = _split_obj[toSplitIdx];
		var stSec = convertTimeStringToInt(o.start);
		var endSec = convertTimeStringToInt(o.end);
		//在這分段就把分段點設上去
		_st_cue_point = stSec;
		_end_cue_point = endSec;
		_imedia_player_api.setCuepoints([stSec, endSec]);
		_split_call_back(toSplitIdx);
		_split_mode_now_index = toSplitIdx;
		return false;
	}else{
		playSplit(_split_mode_now_index);
		return true;
	}

}


//------------------------- split mode

var fp_container_id = 'my_player'; // 裝載播放器的Container id
var fp_poster = null; // 影片起始畫面
var fp_swf_url = flowplayer.defaults.swf; // swf版播放器載入來源
var fp_swfhls_url = flowplayer.defaults.swfHls; //hls-swf版播放器載入來源
var fp_autoplay = flowplayer.defaults.autoplay;
var fp_func_add_use_count = null; // 累加點閱數
var fp_playlist_on_changed = null; // 播放項目改變時的Callback
var fp_bgcolor = '#000000';
var fp_loop = false; // 播完最後一個項目後從頭開始
var fp_live = false; // 是不是直播訊號
var fp_default_css = 'fp-full fp-edgy fp-outlined fp-mute'; //預設使用Full樣式(接近Youtube)
var fp_audio_only = false;
var fp_fullscreen = true;
var fp_muted = false;

if ( ! window.console ) console = { log: function(){}, debug: function(){} };

function init_flowplayer_for_imedia() {
	// 初始化專屬iMedia使用的flowplayer
	if (_debug) console.log('init_flowplayer_for_imedia');
	
	if (!flowplayer) return;
	
	// Config for Global flowplayer
	flowplayer.conf = {
//		'engine':'flash'	,
		'swf': fp_swf_url,
		'swfHls': fp_swfhls_url,
		'radio': false,
		'aspectRatio':  '16:9',
		'adaptiveRatio': false, // Disable player auto-size accroding to video's aspect ratio.
		'autoplay': false,
		'debug': false,
		'loop': fp_loop, // Continue from the first clip when last clip ends.
		'disable': false, // Disable UI like seeking, pasuing etc.
		'keyboard': true, // Keyboard shortcuts is enabled
		'live': fp_live, // Player is set up for live streaming.
		'native_fullscreen': true, //Use native fullscreen in mobile browser instead of the full browser window.
		'fullscreen': fp_fullscreen, //Whether fullscreen is enabled. Defaults to false when the player is viewed in an IFRAME. Must therefore be set to true explicitly to enable players in an IFRAME to go fullscreen.
		'share': false, //關閉分享功能
		'customPlaylist': true, //關閉預設的播放清單功能
		'embed': false, // Show Embed Button
		'wmode': 'transparent' , // Used by the Flash engine，要用這種模式才能在使用Flash-Player且沒有畫面時顯示背景圖片
        'key': "$545665653072655, $246084523934726, $592967957673380, $859324883579847, $550733753565590", //localhost, 127.0.0.1, imedia.culture.tw, imedia.smartfun.com.tw, learning.moc.gov.tw
		'audioOnly':fp_audio_only,
		'startLevel': "auto",
		'smoothSwitching':false,
        'vrvideo': {
            polyfill: true,
            forceColorFlip: true,
            camerafront: true, //
            fov: 90,
            projection: "360_MONO",
            /*projection: "180_LR",*/
            /*projection: "360_TB",*/
            /*projection: "360_CUBE",*/
            /*projection: "2D",*/
         }
	};
	
	// 如果有完整內容的播放清單，就以完整內容作為初始播放來源
	_current_playlist_type = _fp_formal_playlist.length?'formal':'preview';
	
	_jq_fp_container = $('#'+fp_container_id);
	
	// 為了讓flowplayer可以透過鍵盤操作，需要讓這個div可以獲取焦點
	_jq_fp_container.attr('tabindex', '0');
		
	// 初始化imedia用播放器
	_imedia_player_api = flowplayer('#'+fp_container_id,{
		'poster': fp_poster,
		'splash': true,
		'playlist': load_playlist(),
		'autoplay':fp_autoplay,
		'advance':true,
		'bgcolor':fp_bgcolor,
		'muted':fp_muted
	});
	
	if (!_imedia_player_api) return;
	// 如果要自動播放，就開始載入內容，不然好像沒效
	if (fp_autoplay) {
		_imedia_player_api.load();
	}
	
	_fullscreen_btn = $(".fp-fullscreen", _jq_fp_container);
	
	// 加上一些訂製的按鈕
//	var fp_cc = '<strong class="fp-cc" title="外掛字幕">CC</strong>';
    var fp_play_type = '<strong class="fp-playtype fp-icon" title="播放模式"></strong>';
    var fp_search = '<strong class="fp-search fp-icon" title="搜尋"></strong>';
//    var fp_fullscreen = '<a class="fp-fullscreen fp-icon" title="全螢幕"></a>';
    
    // 移除內建的按鈕
//    $('.fp-controls .fp-cc').remove(); // 移除原本cc按鈕 
//    $('.fp-header>.fp-fullscreen').remove(); // 移除原本fullscreen按鈕
    
    // 新增需要的自訂按鈕
    // 要確定畫面上有功能表時才顯示按鈕
    // 檢查是否有搜尋視窗
    if ($('.fp-search-menu').length) {
    	$('.fp-controls').append(fp_search);
    	$('.fp-ui').append($('.fp-search-menu'));
    	$('.fp-search-menu').css('display', '');
    }
    // 檢查是否有播放模式選單
    if ($('.fp-playtype-menu').length && $('.fp-ab-menu').length) {
    	$('.fp-controls').append(fp_play_type);
    	$('.fp-ui').append($('.fp-playtype-menu'),$('.fp-ab-menu'));
    	$('.fp-playtype-menu').css('display', '');
    	$('.fp-ab-menu').css('display', '');
    }
    // 按下按鈕展開次選單
    $('.fp-playtype').click(function(){
        if ($('.fp-playtype-menu').hasClass('fp-active')) {
        	$('.fp-playtype-menu').removeClass('fp-active').css('top','-9999em');
    	} else {
    		$('.fp-menu.fp-active','.fp-ui').removeClass('fp-active').css('top','-9999em');
    		$('.fp-playtype-menu').addClass('fp-active').css('top','auto');
        }
    });
    
    $('.fp-search').click(function(){
        if ($('.fp-search-menu').hasClass('fp-active')) {
        	$('.fp-search-menu').removeClass('fp-active').css('top','-9999em');
        } else {
	        $('.fp-menu.fp-active','.fp-ui').removeClass('fp-active').css('top','-9999em');
	        $('.fp-search-menu').addClass('fp-active').css('top','auto');
        }
    });
    
    // 讓自訂的選單可見
    //$('.fp-custom-menu').css('visibility', 'visible');
    
    // 選擇播放模式
    $('.fp-playtype-menu a').click(function(){
    	var _type = $(this).attr('data-playtype');
		if(_type == 'is-ab'){
			// 選擇AB段跳出設定選單
			$('.fp-playtype-menu').removeClass('fp-active');
			$('.fp-ab-menu').addClass('fp-active').css('top','auto');
       }else{
    	   	$(this).addClass('fp-selected').siblings('a').removeClass('fp-selected');
	   		$('.flowplayer').removeClass('is-default is-repeat is-shuffle is-ab').addClass(_type);
	   		// 其他播放模式
   			if (_type == "is-default"){
				loopPlaylist(true);
   			} else if(_type == "is-repeat"){
				loopCurrentClip(true);
			} else if(_type == "is-shuffle"){
				randomPlay(true);
			}
       }
    });
    
    // 送出A/B段時間
    $('#fp-ab-set').click(function(){
    	//-------split mode changr
    	_split_mode = false;
    	//-----------split mode change
    	
    	$('a[data-playtype="is-ab"]').addClass('fp-selected').siblings('a').removeClass('fp-selected');
    	var _fp_start = $('#start_hh').val()+':'+$('#start_mm').val()+':'+$('#start_ss').val();
    	var _fp_end = $('#end_hh').val()+':'+$('#end_mm').val()+':'+$('#end_ss').val();
    	$('.flowplayer').removeClass('is-default is-repeat is-shuffle').addClass('is-ab');
    	$('.fp-ab-menu').removeClass('fp-active');
    	abPlay(true, _fp_start, _fp_end);
//    	console.log('起:'+_fp_start+',迄：'+_fp_end);
    });
    
    // 讓點在選單以外的地方可關閉選單
//    $(document).mouseup(function(e){
//    	var container = $(".fp-menu");
//    	if (!container.is(e.target) && container.has(e.target).length === 0 && !$('.fp-icon').is(e.target)){
//    		container.removeClass('fp-active');
//    	}
//    });
	
	if (_fp_preview_playlist.length == 0 && _fp_formal_playlist.length == 0) {
		// 沒有可以播放的內容，將Loading動畫給隱藏
		$('.fp-waiting').hide();
	} else {
		_imedia_player_api.disable(false);
	}
	
	_imedia_player_api.on('load', function(e,api) {
		// 取得目前正在播放哪個項目
		_last_idx = _current_idx;
		_current_idx = api.video.index;
		if (_debug) console.log(_current_idx + ' is load.');
		reset_progress();
		_will_play = null;
		api.loading = false;
		// 把AB段的設定清除
		abPlay(false, 0, 0);
	}).on('ready', function(e,api) {
		//split mode cgange
		if(_split_mode){
			$('.fp-playtype').remove();
			$('.fp-search').remove();
		}
		//split mode cgange
//		console.log(_split_mode)
		// 取得目前正在播放哪個項目
		_current_idx = api.video.index;
		call_playlist_on_changed(_current_playlist_type, _last_idx, _current_idx);
		if (_debug) console.log(_current_idx + ' is ready.');
		if (is_formal_playing()) {
			// 只有正式播放才計入點擊數
			_will_play = _fp_media_list[_current_idx];
			_fp_played_list.push(_will_play);
		}
		_on_error = false;
		_last_idx = _current_idx;
		// 將全螢幕的按鈕移到下方的控制Bar
		$(".fp-controls", _jq_fp_container).append(_fullscreen_btn);
		// 讓聲音的封面圖可以等比縮小呈現在播放器的範圍內
		$(".fp-player", _jq_fp_container).css({"background-size":"contain","background-repeat":"no-repeat","background-position":"center"});
		// 如果播放說屬於重複一首的模式，則手動切換的曲目應該也要套用
		api.video.loop = _loop_one;
		$('a', _jq_fp_container).attr('tabindex', '-1');
		if (_debug) console.log('Current clip will ' + (api.video.loop?'':'not') + ' loop.');
		
		 if(_split_mode){
			 playSplit(0);
		 }
	}).on('progress', function() {
		// 這裡是為了用來記錄觀看次數，所以每個內容再一次循環裡只要發生一次就好
		if (_will_play != null && fp_func_add_use_count) {
			fp_func_add_use_count(_will_play);
			if (_debug) console.log(_will_play + ' add use count.');
			_will_play = null;
		}
	}).on('finish', function(e, api) {
		if (_debug) console.log(_current_idx + ' is finish.');
		if (_debug) console.log('Random Mode ... ' + (_random_mode? 'True' : 'False'));
		if (_random_mode) {
			// 隨機模式，選擇下一首
			while(_fp_play_order.length > 0) {
				var next = _fp_play_order.pop();
				if (_fp_played_list.indexOf(next) == -1) {
					if (_debug) console.log('(Random)Next Will Play ' + _fp_media_list.indexOf(next));
					
					// 這首還沒播過
					_fp_played_list.push(next);
					if (is_formal_playing()) {
						play_formal(_fp_media_list.indexOf(next));
					} else {
						play_preview(_fp_media_list.indexOf(next));
					}
					break;
				}
			}
		} else {
			if(api.video.is_last && !api.conf.loop) {
				// 已經播完最後一首了，準備停止
				call_playlist_on_changed(_current_playlist_type, _last_idx, -1);
			}
		}
	}).on('error', function(e, api, err) {
		if (_debug) console.log('error', err);
		if (err.code == 4) {
			if (_debug) console.log('api_status', api);
			// Video Not Found
			// reset state
			_on_error = true;
			// 重置錯誤狀態
		    api.error = api.loading = api.playing = false;
		    // 隱藏錯誤訊息
		    $(".fp-message", _jq_fp_container).css({opacity: 0});
		    _jq_fp_container.removeClass("is-error");
		    // 重置播放狀態
		    reset_progress();
		    reset_time();
		   	// 重置目前播放項目
		   	call_playlist_on_changed(_current_playlist_type, _last_idx, -1);
		    // 確定是不是因為不允許的內容所造成
		   	var title = err.video.title;
		   	var err_message = '';
		    if (api.video.src != _fake_url) {
		    	// 顯示錯誤訊息
		    	// IE11+Win10，明明就可以播，但是就是會觸發一次Error
			    var action = _current_playlist_type == 'preview'?'預覽':'播放';
			    err_message = '無法' + action + title + '，請選擇其他內容！';
		    } else {
		    	if (_debug) console.log(api.video.index, '@', _current_playlist_type, api.video.is_last);
		    	// 因為假網址造成的播放錯誤
		    	if (_current_playlist_type == 'formal' && !api.video.is_last) {
		    		// 如果是自動播放，且不是最後一項時，播放下一首
		    		//api.next();
		    		err_message = '略過：'+title;
		    		if (_timeout != null) {
		    			clearTimeout(_timeout);
		    		}
		    		_timeout = setTimeout(function(){api.next();}, 1000);
		    	}
		    }
		    // 因為IE11 + Win10的問題，先把這個功能拿掉
//		    if (err_message != '') {
//		    	api.message(err_message, 1000);
//		    }
		}
	}).on('beforeseek', function(e, api) {
		if (_debug) console.log('beforeseek', e);
		if (_on_error) {
			reset_progress();
			reset_time();
			e.preventDefault();
		}
	}).on('seek', function(e, api) {
		//split mode change
		if(_split_mode){
			if(checkSplit(api.video.time)){
			return;
			}
		}
//		console.log(api.video.time)
		if (_debug) console.log('seek', e);
		if (_on_error) {
			reset_progress();
			reset_time();
		} else {
			// 重置目前播放項目
		   	call_playlist_on_changed(_current_playlist_type, _last_idx, _last_idx);
		}
	}).on('unload', function(e) {
		if (_debug) console.log('unload', e);
	}).on('shutdown', function(e) {
		if (_debug) console.log('shutdown', e);
	}).on('resume', function(e) {
		if (_debug) console.log('resume', e);
	}).on('cuepoint', function(e, api, cuepoint) {
		if (_debug) console.log("clip " + api.video.index, "cuepoint " + cuepoint.time);
		
		
		if (cuepoint.time == _end_cue_point) {
			// split mode change
			if(_split_mode){
				//取得下一段
				playNextSplit();
			}else{
				api.seek(_st_cue_point);
			}
			//split mode change
			
		}
	});
	
	var css_for_bg_cover = {
			"background-repeat":"no-repeat",
			"background-position":"center center",
			"background-size":"contain",
			"-webkit-background-size":"contain",
			"-moz-background-size":"contain"
	};
			
	$('.fp-player', _jq_fp_container).css(css_for_bg_cover);
}

function call_playlist_on_changed(playlist_type, last_idx, current_idx) {
	// 在播放曲目變動時呼叫
	if (fp_playlist_on_changed != null && typeof fp_playlist_on_changed == 'function') {
		fp_playlist_on_changed(playlist_type, last_idx, current_idx);
	}
}

function player_seek(time){
	// 變更播放時間點
	goto(time)
}

function reset_progress() {
	// 清除載入與播放進度條
	$('.fp-buffer', '#'+fp_container_id).css('width', '0%');
	$('.fp-progress', '#'+fp_container_id).css('width', '0%');
	
}

function reset_time() {
	// 清除長度、已播放時間、剩餘時間
	$('.fp-elapsed', '#'+fp_container_id).text('00:00');
	$('.fp-remaining', '#'+fp_container_id).text('00:00');
	$('.fp-duration', '#'+fp_container_id).text('00:00');
}

function fp_add_media(media_id) {
	// 紀錄所有曲目編號
	_fp_media_list.push(media_id);
	_fp_play_order.push(media_id);
}

function fp_add_preview(sources, title, loop, live, audio, coverImage , vr) {
	// 新增一筆預覽曲目
	_fp_preview_playlist.push(create_clip(sources, title, loop, live, audio, coverImage, null, null, null, vr));
}

function fp_add_formal(sources, title, loop, live, audio, coverImage, subtitles, channel_alias, media_id, vr) {
	// 新增一筆正式曲目
	_fp_formal_playlist.push(create_clip(sources, title, loop, live, audio, coverImage, subtitles, channel_alias, media_id, vr));
}

function create_clip(sources, title, loop, live, audio, coverImage ,subtitles, channel_alias, media_id, vr) {
	// 產生播放清單中的曲目
	sources = typeof sources !== 'undefined' ? sources:[{'type': 'application/x-mpegurl', 'src': _fake_url}];
	title = typeof title !== 'undefined' ? title:'';
	loop = typeof loop !== 'undefined' ? loop:false;
	live = typeof live !== 'undefined' ? live:false;
	audio = typeof audio !== 'undefined' ? audio:false;
	coverImage = typeof coverImage !== 'undefined' ? coverImage:'';
    vr = typeof vr !== 'undefined' ? vr:false;
	
	var clip = {
			'title': title,
			'sources': sources,
			'loop': loop,
			'live': live,
			'audio': audio,
			'coverImage': coverImage,
            'vr': vr
		}
	
	if (subtitles){
		clip['subtitles'] = subtitles;
	}
	
	if (channel_alias && media_id) {
		clip['thumbnails'] = {
	        template: "https://imedia-assets.s3.hicloud.net.tw/"+channel_alias+"/"+media_id+"/screenshots/{time}.jpg",
	        preload: false,
	        lazyload: false
	    }
	}
	
	return clip;
}

function load_playlist() {
	// 根據目前播放的種類載入播放清單
	if (_current_playlist_type == 'formal' && !_no_formal_content_to_play()) {
		return _fp_formal_playlist;
	} else {
		_current_playlist_type = 'preview';
		return _fp_preview_playlist;
	}
}

function _no_formal_content_to_play() {
	// 用來判斷是否有正式的內容可以播
	var no_formal_content = true;
	
	for (var i=0; i<_fp_formal_playlist.length; i++) {
		var clip = _fp_formal_playlist[i];
		if (!clip) break;
		
		sources = clip['sources'];
		if (sources && sources.constructor === Array) {
			for (var idx in sources) {
				var source = sources[idx];
				// 為了處理方便，在我們實作的邏輯中透過一個假的url來作為空物件的播放網址
				// ，所以判斷是不是假網址就知道有沒有實際內容
				if (source['src'] && source['src'] != _fake_url) {
					return false;
				}
			}
		}
	}
	
	return no_formal_content;
}

function is_preview_playing() {
	// 是否正在播放預覽項目
	if (_debug) console.log('now use ' + _current_playlist_type + ' playlist.');
	return _current_playlist_type == 'preview';
}

function is_formal_playing() {
	// 是否正在播放完整項目
	if (_debug) console.log('now use ' + _current_playlist_type + ' playlist.');
	return _current_playlist_type == 'formal';
}

function check_source(idx) {
	var playlist = load_playlist();
	var source = playlist[idx].sources[0];
	
	if (typeof source['src'] == 'undefined' || source['src'] == '' || source['src'] == _fake_url) {
		// 表示這個內容是空的，沒有權限播放
		return false;
	} else {
		return true;
	}
}

function play_formal(idx) {
	// 播放完整項目
	idx = typeof idx !== 'undefined' ? idx:0;
	if (_fp_formal_playlist.length == 0) {
		// 正式播放清單中沒有值
		return;
	}
	
	if ((idx < 0) || (idx >= _fp_formal_playlist.length)) {
		// 不合理	的曲目
		return;
	}
	
	if (is_formal_playing()) {
		// 要播放的內容在目前清單中
		if (_loop_one) {
			// 這個曲目正在循環播放中
			_imedia_player_api.video.loop = false; // 關閉目前片段的循環
		}
	} else {
		// 切換成新的播放清單
		_current_playlist_type = 'formal';
		// 切換成完整播放時，將自動換首的功能切回設定值
		_imedia_player_api.conf.advance = fp_autoplay;
		_imedia_player_api.setPlaylist(load_playlist());
	}
	
	if (check_source(idx)) {
		_imedia_player_api.play(idx);
	} else {
		alert('登入會員後瀏覽！');
	}
}

function play_preview(idx) {
	// 播放預覽項目
	idx = typeof idx !== 'undefined' ? idx:0;
	if (_fp_preview_playlist.length == 0) {
		// 預覽播放清單中沒有值
		return;
	}
	
	if ((idx < 0) || (idx >= _fp_preview_playlist.length)) {
		// 不合理	的曲目
		return;
	}
	
	if (is_preview_playing()) {
		// 要播放的內容在目前清單中
	} else {
		// 切換成新的播放清單
		_current_playlist_type = 'preview';
		// 切換成預覽時，不自動換首
		_imedia_player_api.conf.advance = false;
		_imedia_player_api.setPlaylist(load_playlist());
	}
	
	if (check_source(idx)) {
		_imedia_player_api.play(idx);
	} else {
		alert('登入會員後瀏覽！');
	}
}

function sleep(milliseconds) {
	var start = new Date().getTime();
	for (var i = 0; i < 1e7; i++) {
		if ((new Date().getTime() - start) > milliseconds){
			break;
		}
	}
}

function loopPlaylist(enabled) {
	// (啟動或關閉)整個播放清單循環播放
	_imedia_player_api.conf['loop'] = enabled;
	_loop_all = false;
	if (enabled) {
		loopCurrentClip(false);
		randomPlay(false);
	}
}

function loopCurrentClip(enabled) {
	// (啟動或關閉)目前片段的循環播放
	_imedia_player_api.video.loop = enabled;
	_loop_one = enabled;
	if (enabled) {
		loopPlaylist(false);
		randomPlay(false);
	}
}

function randomPlay(enabled) {
	// (啟動或關閉)隨機播放
	_imedia_player_api.conf.advance = !enabled; //如果是隨機播放，就不要讓播放器自動換首
	_random_mode = enabled;
	if (enabled) {
		// 啟動隨機播放
		loopCurrentClip(false);
		loopPlaylist(false);
		
		// 產生一份亂數的播放順序
		_fp_play_order = shuffle(_fp_media_list);
		// 清空已播放紀錄
		_fp_played_list = [];
		// 把目前播放的曲目加到播放紀錄中
		_fp_played_list.push(_fp_media_list[_imedia_player_api.video.index]);
	}
}




function abPlay(enabled, sttime, endtime) {
	// (啟動或關閉)AB段播放	
	if (enabled) {
		if (_debug) console.log("Will play from " + sttime + " to " + endtime);
		var stSec = convertTimeStringToInt(sttime);
		var endSec = convertTimeStringToInt(endtime);

		_st_cue_point = stSec;
		_end_cue_point = endSec;
		_imedia_player_api.setCuepoints([stSec, endSec]);
		_imedia_player_api.seek(stSec);
	} else {
		_st_cue_point = null;
		_end_cue_point = null;
		_imedia_player_api.setCuepoints([]);
	}
}

function goto(time) {
	// 跳到特定的時間點
	if (_debug) console.log('Will goto ' + time);
	var gotoSec = convertTimeStringToInt(time);
	_imedia_player_api.seek(gotoSec);
}

function convertTimeStringToInt(timeString) {
	console.log(timeString);
	if (timeString === parseFloat(timeString)) {
		return timeString;
	} else if (timeString === parseFloat(timeString).toString()) {
		return parseInt(timeString, 10);
	} else {
		// 預期是一個代表時間的字串(h:m:s)
		var sec = 0;
		els = timeString.split(':');
		if (els.length == 3) {
			sec = parseInt(els[0], 10) * 3600 + parseInt(els[1], 10) * 60 + parseInt(els[2], 10);
		} else if (els.length == 2) {
			sec = parseInt(els[0], 10) * 60 + parseInt(els[1], 10);
		}
		return sec;
	}
}

function shuffle(array) {
	tmpArray = array.slice();
	
	// 將陣列亂數排序
	var currentIndex = tmpArray.length, temporaryValue, randomIndex;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {
		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = tmpArray[currentIndex];
		tmpArray[currentIndex] = tmpArray[randomIndex];
		tmpArray[randomIndex] = temporaryValue;
	}
	return tmpArray;
}


// 頁面載入完成後就開始初始化播放器
$(function(){
	$('#'+fp_container_id).addClass(fp_default_css);
	init_flowplayer_for_imedia();
})