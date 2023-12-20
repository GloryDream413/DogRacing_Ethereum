function CMenu() {
    var _oBg;
    var _oButPlay;
    var _oFade;
    var _oAudioToggle;
    var _oButCredits;
    var _oCreditsPanel = null;
    var _oButFullscreen;
    var _fRequestFullScreen = null;
    var _fCancelFullScreen = null;
    var _oLogo;
    
    var _pStartPosPlay;
    var _pStartPosAudio;
    var _pStartPosCredits;
    var _pStartPosFullscreen;
    var _pStartPosLogo;

    this._init = function () {
        _oBg = createBitmap(s_oSpriteLibrary.getSprite('bg_menu'));
        s_oStage.addChild(_oBg);

        var oSpritePlay = s_oSpriteLibrary.getSprite('but_play');
        _pStartPosPlay = {x:CANVAS_WIDTH/2,y:CANVAS_HEIGHT - oSpritePlay.height/2 - 10};
        _oButPlay = new CGfxButton(_pStartPosPlay.x, _pStartPosPlay.y, oSpritePlay);
        _oButPlay.addEventListener(ON_MOUSE_UP, this._onButPlayRelease, this);

        $("#walletId").click((e) => {
            accountId = e.target.value;
            if (e.target.value == '')
                walletConnectBtn.changeText("  " + TEXT_CONNECT_WALLET + "  ");
            else
                walletConnectBtn.changeText("  " + e.target.value + "  "  + "\n  Disconnect" + "  ");
        })

        oSpriteConnect = s_oSpriteLibrary.getSprite('but_bg');
        _pStartPosWalletConnect = {x:CANVAS_WIDTH - oSpriteConnect.width/2 - 10,y:(oSpriteConnect.height / 2) + 10};
        
        if ($("#walletId").val() == "") {
            accountId = '';
            walletConnectBtn = new CTextButton(_pStartPosWalletConnect.x, _pStartPosWalletConnect.y, oSpriteConnect, "  " + TEXT_CONNECT_WALLET + "  ", FONT_GAME_1, "#ffffff", 25, s_oStage);
        } else {
            accountId = $("#walletId").val();
            walletConnectBtn = new CTextButton(_pStartPosWalletConnect.x, _pStartPosWalletConnect.y, oSpriteConnect, "  " + accountId + "  "  + "\n  Disconnect" + "  ", FONT_GAME_1, "#ffffff", 25, s_oStage);
        }

        walletConnectBtn.addEventListener(ON_MOUSE_UP, this._onConnectWallet, this);

        var oSpriteSetting = s_oSpriteLibrary.getSprite('but_setting');
        _pStartPosSetting = {x:10 + oSpriteSetting.width/2,y:CANVAS_HEIGHT - oSpriteSetting.height/2 - 10};
        _oButSetting = new CGfxButton(_pStartPosSetting.x, _pStartPosSetting.y, oSpriteSetting);
        _oButSetting.addEventListener(ON_MOUSE_UP, this._onButSettingRelease, this);
        if ($("#treasury").val() === "true")
            _oButSetting.setVisible(true);
        else
            _oButSetting.setVisible(false);

        $("#treasury").click((e) => {
            if ($("#treasury").val() === "true")
                _oButSetting.setVisible(true);
            else
                _oButSetting.setVisible(false);
        })

        var oSprite = s_oSpriteLibrary.getSprite('but_credits');
        _pStartPosCredits = {x:10 + oSprite.width/2,y:(oSprite.height / 2) + 10};
        if(SHOW_CREDITS){
            // _pStartPosCredits = {x:10 + oSprite.width/2,y:(oSprite.height / 2) + 10};
            _oButCredits = new CGfxButton(_pStartPosCredits.x, _pStartPosCredits.y, oSprite);
            _oButCredits.addEventListener(ON_MOUSE_UP, this._onCredits, this);
            
            _pStartPosFullscreen = {x:_pStartPosCredits.x,y:_pStartPosCredits.y + oSprite.height + 10};
        }else{
            _pStartPosFullscreen = {x:10 + oSprite.width/2,y:(oSprite.height / 2) + 10};
        }

        
        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            var oSprite = s_oSpriteLibrary.getSprite('audio_icon');
            _pStartPosAudio = {x: _pStartPosCredits.x, y: (oSprite.height * 2.5) + 30};
            if(!SHOW_CREDITS) _pStartPosAudio = {x: _pStartPosCredits.x, y: (oSprite.height * 1.5) + 20};
            _oAudioToggle = new CToggle(_pStartPosAudio.x, _pStartPosAudio.y, oSprite, s_bAudioActive,s_oStage);
            _oAudioToggle.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this);
        }

        var oSpriteStats = s_oSpriteLibrary.getSprite('but_stats');
        _pStartPosStats = {x: _pStartPosCredits.x, y: (oSpriteStats.height * 3.5) + 40};
        if(!SHOW_CREDITS) _pStartPosStats = {x: _pStartPosCredits.x, y: (oSpriteStats.height * 2.5) + 30};
        _oButStats = new CGfxButton(_pStartPosStats.x, _pStartPosStats.y, oSpriteStats);
        _oButStats.addEventListener(ON_MOUSE_UP, this._onShowStats, this);
        
        var doc = window.document;
        var docEl = doc.documentElement;
        _fRequestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
        _fCancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
        
        if(ENABLE_FULLSCREEN === false){
            _fRequestFullScreen = false;
        }
        
        if (_fRequestFullScreen && inIframe() === false){
            oSprite = s_oSpriteLibrary.getSprite('but_fullscreen');

            _oButFullscreen = new CToggle(_pStartPosFullscreen.x,_pStartPosFullscreen.y,oSprite,s_bFullscreen,s_oStage);
            _oButFullscreen.addEventListener(ON_MOUSE_UP, this._onFullscreenRelease, this);
        }
        
        var oSpriteLogo = s_oSpriteLibrary.getSprite("logo_menu");
        _pStartPosLogo = {x:CANVAS_WIDTH/2,y:10};
        _oLogo = createBitmap(oSpriteLogo);
        _oLogo.regX = oSpriteLogo.width/2;
        _oLogo.x = _pStartPosLogo.x;
        _oLogo.y = _pStartPosLogo.y;
        s_oStage.addChild(_oLogo);

        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        s_oStage.addChild(_oFade);

        createjs.Tween.get(_oFade).to({alpha: 0}, 1000).call(function () {
            s_oStage.removeChild(_oFade);
        });

        this.refreshButtonPos(s_iOffsetX, s_iOffsetY);
    };

    this._onConnectWallet = function () {
        if($("#walletId").val() === "")
        {
            accountId = '';
            document.getElementById("connectWallet").click();
        }
        else
        {
            document.getElementById("disconnectWallet").click();
        }
    }

    this.unload = function () {
        _oButPlay.unload();
        _oButPlay = null;
        
        if(SHOW_CREDITS){
            _oButCredits.unload();
        }
        
        s_oStage.removeChild(_oBg);
        _oBg = null;

        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            _oAudioToggle.unload();
            _oAudioToggle = null;
        }
        if (_fRequestFullScreen && inIframe() === false){
            _oButFullscreen.unload();
        }
        s_oMenu = null;
    };

    this.refreshButtonPos = function (iNewX, iNewY) {
        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            _oAudioToggle.setPosition(_pStartPosAudio.x - iNewX, _pStartPosAudio.y + iNewY);
        }
        if (_fRequestFullScreen && inIframe() === false){
            _oButFullscreen.setPosition(_pStartPosFullscreen.x + iNewX,_pStartPosFullscreen.y + iNewY);
        }
        
        _oButPlay.setPosition(_pStartPosPlay.x,_pStartPosPlay.y - iNewY);
        if(SHOW_CREDITS){
            _oButCredits.setPosition(_pStartPosCredits.x + iNewX,_pStartPosCredits.y + iNewY);
        }
        walletConnectBtn.setPosition(_pStartPosWalletConnect.x + iNewX,_pStartPosWalletConnect.y + iNewY);
        _oButSetting.setPosition(_pStartPosSetting.x + iNewX,_pStartPosSetting.y - iNewY);
        _oButStats.setPosition(_pStartPosStats.x + iNewX,_pStartPosStats.y + iNewY);
        
        
        if(_oCreditsPanel !== null){
            _oCreditsPanel.refreshButtonPos(iNewX, iNewY);
        }
        
        _oLogo.y = _pStartPosLogo.y + iNewY;
    };
    
    this.exitFromCredits = function(){
        _oCreditsPanel = null;
    };

    this._onAudioToggle = function () {
        Howler.mute(s_bAudioActive);
        s_bAudioActive = !s_bAudioActive;
    };
    
    this._onCredits = function(){
        // _oCreditsPanel = new CCreditsPanel();
        $("#leaderBoard").click();
    };

    this._onShowStats = function(){
        $("#stats").click();
    }

    this._onButPlayRelease = function () {
        if ($("#walletId").val() == "") {
            $("#toastStrInput").val("Please connect to wallet!")
            $("#toastStrInput").attr("toastflg","1");
            document.getElementById("toastAlertBtn").click();
            return;
        }

        var _walletId = $("#walletId").val();
        const url = 'https://dog-racing.wiprotechinc.com/api/control/playBtn';
        // const url = 'http://localhost:5000/api/control/playBtn';
        const data = {
            accountId: _walletId
        };

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            if(data.result)
            {
                document.getElementById("startround").setAttribute ("betamount", 0);
                $("#startround").click();
                this.unload();
                s_oMain.gotoBetPanel();
            }
            else
            {
                document.getElementById ("playBtn").click();
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    };
    
    this.resetFullscreenBut = function(){
        if (_fRequestFullScreen && screenfull.isEnabled){
            _oButFullscreen.setActive(s_bFullscreen);
        }
    };

    this._onButSettingRelease = function () {
        document.getElementById("setting").click();
    }

    this._onFullscreenRelease = function(){
	if(s_bFullscreen) { 
		_fCancelFullScreen.call(window.document);
	}else{
		_fRequestFullScreen.call(window.document.documentElement);
	}
	
	sizeHandler();
    };

    s_oMenu = this;

    this._init();
}

var s_oMenu = null;