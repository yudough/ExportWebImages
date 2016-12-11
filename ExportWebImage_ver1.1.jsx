/*
<javascriptresource>
<name>ExportWebImage</name>
<menu>automate</menu>
<about>jsxでイメージをjpgかpngでプレビューなしで書き出します。</about>
<category>Qscript</category>
<enableinfo>true</enableinfo>
</javascriptresource>
*/

//初期化設定

preferences.rulerUnits = Units.PIXELS;// 単位を px に変更
doc = app.activeDocument;
var doc, docname, saveFile, folder, fsName, tmpFileName, saveOpt,w, h, res, saveGUI, extType, extTypePNG, extTypeJPG, w, h, res, saveGUI, longSide, unitType, exportDoc, shortSide, longSideNum, exportLongSide,exportShortSide,resizeLong,resizeShort;
var fileName, pngOpt, jpgOpt, gifOpt, hisObj,layObj;
doc = app.activeDocument;
//ダイアログボックスを作成------------------------------------------//
	//キャンバスサイズを取得
	docInfo();
	//ダイアログボックスの大きさ
	saveGUI = new Window("dialog", "書き出しオプション", [0,100,402,100+226]);
	//中央に配置
	saveGUI.center(); 
	//ドキュメント名を取得
	docname = splitExt(fileName);
	//ドキュメントの長辺を取得
	docLongSide();
	//パネルの作成
	saveGUI.btnPnl = saveGUI.add("panel",[10,10,402-10,226-10],"");
	saveGUI.btnPnl = saveGUI.add("panel",[29,80,29+180,226-63],"サイズ設定");
	saveGUI.btnPnl = saveGUI.add("panel",[402-180,80,402-30,226-63],"拡張子設定");
	//ファイル名の指定
	saveGUI.btnPnl = saveGUI.add("panel", [29,20,402-29,55+20],"ファイル名");
	saveGUI.addDocName = saveGUI.add("edittext", [29+10,40,402-39,40+20],docname[0]);
	//長辺のテキストボックス
	saveGUI.sText = saveGUI.add("statictext",[40,100,40+90,100+20], "長辺のサイズ:");
	saveGUI.longSide = saveGUI.add("edittext",[125,100,125+70,100+20],longSide);
	
	//単位の指定
	saveGUI.sText = saveGUI.add("statictext",[40,135,40+40,135+10], "単位:");
	saveGUI.rBtn1 = saveGUI.add("radiobutton",[120,133,120+40,133+20], "px");
	saveGUI.rBtn2 = saveGUI.add("radiobutton",[170,133,170+40,133+20], "%");
	saveGUI.rBtn1.value = true; //初期値
	//書き出すファイルの種類の指定
	saveGUI.cBox1 = saveGUI.add("checkbox",[240,133,262+50,133+20], "PNG");
	saveGUI.cBox2 = saveGUI.add("checkbox",[240,100,262+50,100+20], "JPG");
	saveGUI.cBox1.value = true; //初期値
	
	//OKボタンの作成
	saveGUI.okBtn = saveGUI.add("button",[242,170,242+100,170+35],"いいと思います",{name:"ok"}); 
	//キャンセルボタン
	saveGUI.cancelBtn = saveGUI.add("button",[61,170,61+100,170+35], "ダメですね", {name: "cancel"});
//--------------------------------------------------------------//
//OK処理
	saveGUI.okBtn.onClick = function() {
		//入力されたデータチェック処理
		longSideNum = eval(saveGUI.longSide.text); //長辺サイズを数値型に変換
			// 長辺の長さが0以下でないか
		if(longSideNum < 1) {
			alert( '長辺のサイズが正しく入力されていません' );
	    return false;
	    }
			//単位の判断、サイズの算出(px指定の場合)
		var unitPixel = saveGUI.rBtn1.value;
		var unitPercent = saveGUI.rBtn2.value;
		if(!unitPercent) {
			unitType = "px"; 
			//長辺(longSideNum) / ドキュメントのサイズ(longSide)/100 = 比率
			exportDoc = resizeFix(resizeLong);
			//alert("比率は"+ exportDoc);
		}else{
			unitType = "percent";
			exportDoc = longSideNum;
		}

			//拡張子の判断
		extTypePNG = saveGUI.cBox1.value;
		extTypeJPG = saveGUI.cBox2.value;
		if(!extTypePNG && !extTypeJPG) {
			alert("拡張子が選択されておりません。どれか一つ以上チェックを入れて下さい。");
			return false;
		}
		
			//入力されたファイル名を受け渡す
		tmpFileName = saveGUI.addDocName.text;
		folder = Folder.selectDialog("保存先フォルダの選択してください");
		//スナップショットを作成
		takeSnapShot(doc); //スナップショット
		layObj = doc.artLayers.add(); //レイヤーを新規作成
		doc.activeLayer.name = "MergeLayers"; //レイヤー名を変更
		doc.mergeVisibleLayers(); //画像を統合する
		copyDoc();
		//先ほどのドキュメントをアクティブにする
		activeDocument = doc;
		alert(decodeURIComponent(folder.fsName + "\nの中に書き出しました"));
		revertToSnapshot(doc);
	//ダイアログボックスを閉じる
		saveGUI.close();
	}
//キャンセル処理
	saveGUI.cancelBtn.onClick = saveGUI.close();
//ダイアログボックスを表示する
	saveGUI.show();
	
	
	
	
//-----------------------------------------------------------------------


 //ドキュメントを複製して戻るまで
function copyDoc(){
	//ドキュメントを複製
	var idMk = charIDToTypeID( "Mk  " );
    var desc = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref = new ActionReference();
        var idDcmn = charIDToTypeID( "Dcmn" );
        ref.putClass( idDcmn );
    desc.putReference( idnull, ref );
    var idNm = charIDToTypeID( "Nm  " );
    desc.putString( idNm, activeDocument.name.slice(0, -4) + '.copy.psd' );
    var idUsng = charIDToTypeID( "Usng" );
        var ref1 = new ActionReference();
        var idLyr = charIDToTypeID( "Lyr " );
        var idOrdn = charIDToTypeID( "Ordn" );
        var idTrgt = charIDToTypeID( "Trgt" );
        ref1.putEnumerated( idLyr, idOrdn, idTrgt );
    desc.putReference( idUsng, ref1 );
    var idVrsn = charIDToTypeID( "Vrsn" );
    desc.putInteger( idVrsn, 5 );
executeAction( idMk, desc, DialogModes.NO );

	var copyDoc;
	copyDoc = app.activeDocument;
	var copyDocHisObj = copyDoc.activeHistoryState;
	saveFile = new File(folder.fsName + "/" + tmpFileName[0] + "." + extType); //ファイル名と保存場所の設定
		//拡張子別に書き出し
		if(extTypePNG == true) {
			extType = "png";
			saveOpt = exportPNG24(saveOpt);
			//alert("PNGで書き出します");
			saveToFile(copyDoc);
		}
		if(extTypeJPG == true) {
			extType = "jpg";
			saveOpt = exportJPG(saveOpt);
			//alert("JPGで書き出します");
			saveToFile(copyDoc);
		}
	copyDoc.activeHistoryState = copyDocHisObj;
	return copyDoc.close(SaveOptions.DONOTSAVECHANGES);
}

//PNG24
function exportPNG24(pngOpt) { 
	pngOpt = new ExportOptionsSaveForWeb();
	pngOpt.format = SaveDocumentType.PNG;
	pngOpt.optimized = true;
	pngOpt.interlaced = false;
	pngOpt.PNG8 = false;
	return pngOpt;
}
//JPG
function exportJPG(jpgOpt) {
	jpgOpt = new ExportOptionsSaveForWeb();
	jpgOpt.format = SaveDocumentType.JPEG;
	jpgOpt.includeProfile = false;
	jpgOpt.interlaced = false;
	jpgOpt.optimized = true;
	jpgOpt.quality = 70;
	jpgOpt.blur = 0;
	jpgOpt.matteColor = new RGBColor();
	jpgOpt.matteColor.red = 255;
	jpgOpt.matteColor.green = 255;
	jpgOpt.matteColor.blue = 255;
	return jpgOpt;
}
//GIF
function exportGIF() {
	gifOpt = new ExportOptionsSaveForWeb();
	gifOpt.format = SaveDocumentType.COMPUSERVEGIF;
}

//スナップショットを作成
function takeSnapShot(doc) {
	hisObj = app.activeDocument.activeHistoryState; //現在のスナップショット
	}


//スナップショットから戻る
function revertToSnapshot(doc) {
  app.activeDocument.activeHistoryState = hisObj;
}
//キャンバスサイズを取得
function docInfo(){
	w = activeDocument.width.value; //ドキュメントの横幅
	h = activeDocument.height.value; //ドキュメンドの縦幅
	res = activeDocument.resolution; //解像度
}
//ドキュメントの長辺を取得
function docLongSide(){
	if(w >= h){longSide = w; shortSide = h;}
	 else if(h >= w) {longSide = h; shortSide = w;}
	 else {
		 alert("ドキュメントのサイズ情報が正しく取得できませんでした。")
		 return false;
	 }
	 //alert("長辺は" + longSide +"pxと短辺は"+ shortSide + "px");
}

//長辺からリサイズの割合を割り出す
function resizeFix(resizeLong){
		resizeLong = longSideNum / longSide * 100;
		return resizeLong;
		}

//ドキュメントの名前を取得して拡張子を削除
function splitExt() {
	fileName = activeDocument.name;
	return fileName.split(/\.(?=[^.]+$)/);//splitで拡張子の文字を分割するので引き出したいときは[0]で指定すること！
}

function saveOption(){
	takeSnapShot(doc);
	tmpFileName = splitExt(fileName); //拡張子を抜き取る
	folder = Folder.selectDialog("保存先フォルダの選択してください");
}
function saveToFile(doc){
	saveFile = new File(folder.fsName + "/" + tmpFileName + "." + extType); //ファイル名と保存場所の設定
	doc.resizeImage(UnitValue(exportDoc, "percent"), UnitValue(exportDoc, "percent") , res , ResampleMethod.BICUBIC );
	doc.exportDocument(saveFile, ExportType.SAVEFORWEB, saveOpt);
}