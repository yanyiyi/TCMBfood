!function(e){var t="iCheck",i=t+"-helper",a="radio",s="checked",n="un"+s,o="disabled",r="determinate",c="in"+r,d="update",l="type",u="touchbegin.i touchend.i",f="addClass",h="removeClass",p="trigger",b="label",v="cursor",k=/ipad|iphone|ipod|android|blackberry|windows phone|opera mini|silk/i.test(navigator.userAgent);function g(e,t,i){var n=e[0],u=/er/.test(i)?c:/bl/.test(i)?o:s,f=i==d?{checked:n[s],disabled:n[o],indeterminate:"true"==e.attr(c)||"false"==e.attr(r)}:n[u];if(/^(ch|di|in)/.test(i)&&!f)y(e,u);else if(/^(un|en|de)/.test(i)&&f)m(e,u);else if(i==d)for(var h in f)f[h]?y(e,h,!0):m(e,h,!0);else t&&"toggle"!=i||(t||e[p]("ifClicked"),f?n[l]!==a&&m(e,u):y(e,u))}function y(d,u,p){var b=d[0],k=d.parent(),g=u==s,y=u==c,C=u==o,H=y?r:g?n:"enabled",j=w(d,H+x(b[l])),D=w(d,u+x(b[l]));if(!0!==b[u]){if(!p&&u==s&&b[l]==a&&b.name){var P=d.closest("form"),T='input[name="'+b.name+'"]';(T=P.length?P.find(T):e(T)).each(function(){this!==b&&e(this).data(t)&&m(e(this),u)})}y?(b[u]=!0,b[s]&&m(d,s,"force")):(p||(b[u]=!0),g&&b[c]&&m(d,c,!1)),A(d,g,u,p)}b[o]&&w(d,v,!0)&&k.find("."+i).css(v,"default"),k[f](D||w(d,u)||""),k.attr("role")&&!y&&k.attr("aria-"+(C?o:s),"true"),k[h](j||w(d,H)||"")}function m(e,t,a){var d=e[0],u=e.parent(),p=t==s,b=t==c,k=t==o,g=b?r:p?n:"enabled",y=w(e,g+x(d[l])),m=w(e,t+x(d[l]));!1!==d[t]&&(!b&&a&&"force"!=a||(d[t]=!1),A(e,p,g,a)),!d[o]&&w(e,v,!0)&&u.find("."+i).css(v,"pointer"),u[h](m||w(e,t)||""),u.attr("role")&&!b&&u.attr("aria-"+(k?o:s),"false"),u[f](y||w(e,g)||"")}function C(i,a){i.data(t)&&(i.parent().html(i.attr("style",i.data(t).s||"")),a&&i[p](a),i.off(".i").unwrap(),e(b+'[for="'+i[0].id+'"]').add(i.closest(b)).off(".i"))}function w(e,i,a){if(e.data(t))return e.data(t).o[i+(a?"":"Class")]}function x(e){return e.charAt(0).toUpperCase()+e.slice(1)}function A(e,t,i,a){a||(t&&e[p]("ifToggled"),e[p]("ifChanged")[p]("if"+x(i)))}e.fn[t]=function(n,r){var v='input[type="checkbox"], input[type="'+a+'"]',w=e(),x=function(t){t.each(function(){var t=e(this);w=t.is(v)?w.add(t):w.add(t.find(v))})};if(/^(check|uncheck|toggle|indeterminate|determinate|disable|enable|update|destroy)$/i.test(n))return n=n.toLowerCase(),x(this),w.each(function(){var t=e(this);"destroy"==n?C(t,"ifDestroyed"):g(t,!0,n),e.isFunction(r)&&r()});if("object"!=typeof n&&n)return this;var A=e.extend({checkedClass:s,disabledClass:o,indeterminateClass:c,labelHover:!0},n),H=A.handle,j=A.hoverClass||"hover",D=A.focusClass||"focus",P=A.activeClass||"active",T=!!A.labelHover,F=A.labelHoverClass||"hover",I=0|(""+A.increaseArea).replace("%","");return"checkbox"!=H&&H!=a||(v='input[type="'+H+'"]'),I<-50&&(I=-50),x(this),w.each(function(){var n=e(this);C(n);var r,c=this,v=c.id,w=-I+"%",x=100+2*I+"%",H={position:"absolute",top:w,left:w,display:"block",width:x,height:x,margin:0,padding:0,background:"#fff",border:0,opacity:0},L=k?{position:"absolute",visibility:"hidden"}:I?H:{position:"absolute",opacity:0},M="checkbox"==c[l]?A.checkboxClass||"icheckbox":A.radioClass||"i"+a,N=e(b+'[for="'+v+'"]').add(n.closest(b)),Q=!!A.aria,S=t+"-"+Math.random().toString(36).substr(2,6),U='<div class="'+M+'" '+(Q?'role="'+c[l]+'" ':"");Q&&N.each(function(){U+='aria-labelledby="',this.id?U+=this.id:(this.id=S,U+=S),U+='"'}),U=n.wrap(U+"/>")[p]("ifCreated").parent().append(A.insert),r=e('<ins class="'+i+'"/>').css(H).appendTo(U),n.data(t,{o:A,s:n.attr("style")}).css(L),A.inheritClass&&U[f](c.className||""),A.inheritID&&v&&U.attr("id",t+"-"+v),"static"==U.css("position")&&U.css("position","relative"),g(n,!0,d),N.length&&N.on("click.i mouseover.i mouseout.i "+u,function(t){var i=t[l],a=e(this);if(!c[o]){if("click"==i){if(e(t.target).is("a"))return;g(n,!1,!0)}else T&&(/ut|nd/.test(i)?(U[h](j),a[h](F)):(U[f](j),a[f](F)));if(!k)return!1;t.stopPropagation()}}),n.on("click.i focus.i blur.i keyup.i keydown.i keypress.i",function(e){var t=e[l],i=e.keyCode;return"click"!=t&&("keydown"==t&&32==i?(c[l]==a&&c[s]||(c[s]?m(n,s):y(n,s)),!1):void("keyup"==t&&c[l]==a?!c[s]&&y(n,s):/us|ur/.test(t)&&U["blur"==t?h:f](D)))}),r.on("click mousedown mouseup mouseover mouseout "+u,function(e){var t=e[l],i=/wn|up/.test(t)?P:j;if(!c[o]){if("click"==t?g(n,!1,!0):(/wn|er|in/.test(t)?U[f](i):U[h](i+" "+P),N.length&&T&&i==j&&N[/ut|nd/.test(t)?h:f](F)),!k)return!1;e.stopPropagation()}})})}}(window.jQuery||window.Zepto);