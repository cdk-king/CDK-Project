var Sprite = function(type,artist,behaviors){
	var DEFAULT_WIDTH = 10;
	var DEFAULT_HEIGHT = 10;
	var DEFAULT_OPACITY = 1.0;
	
	this.artist = artist;
	this.type = type;
	this.behaviors = behaviors || [];
	
	this.hOffset = 0;
	this.left = 0;
	this.top = 0;
	this.width = DEFAULT_WIDTH;
	this.height = DEFAULT_HEIGHT;
	this.velocityX = 0;
	this.velocityY = 0;
	this.opacity = DEFAULT_OPACITY;
	this.visible = true;
	
};

Sprite.prototype = {
	draw:function(context){
		console.log("Sprite.draw");
		context.save();
		context.globalAlpha = this.opacity;
		if(this.visible && this.artist){
			this.artist.draw(this,context);
		}
		
		context.restore();
	},
	updata:function(now,fps,context,lastAnimationFrameTime){
		for(var i = 0;i < this.behaviors.length;++i){
			this.behaviors[i].execute(this,now,fps,context,lastAnimationFrameTime);
		}
	}
}
