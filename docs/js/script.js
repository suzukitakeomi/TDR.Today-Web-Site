/*
	A simple, lightweight jQuery plugin for creating sortable tables.
	https://github.com/kylefox/jquery-ssort
	Version 0.0.11
*/

(function($) {
	$.tablesort = function ($table, settings) {
		var self = this;
		this.$table = $table;
		this.$thead = this.$table.find('thead');
		this.settings = $.extend({}, $.tablesort.defaults, settings);
		this.$sortCells = this.$thead.length > 0 ? this.$thead.find('th:not(.no-sort)') : this.$table.find('th:not(.no-sort)');
		this.$sortCells.on('click.tablesort', function() {
			self.sort($(this));
		});
		this.index = null;
		this.$th = null;
		this.direction = null;
	};

	$.tablesort.prototype = {

		sort: function(th, direction) {
			var start = new Date(),
				self = this,
				table = this.$table,
				rowsContainer = table.find('tbody').length > 0 ? table.find('tbody') : table,
				rows = rowsContainer.find('tr').has('td, th'),
				cells = rows.find(':nth-child(' + (th.index() + 1) + ')').filter('td, th'),
				sortBy = th.data().sortBy,
				sortedMap = [];

			var unsortedValues = cells.map(function(idx, cell) {
				if (sortBy)
					return (typeof sortBy === 'function') ? sortBy($(th), $(cell), self) : sortBy;
				return ($(this).data().sortValue != null ? $(this).data().sortValue : $(this).text());
			});
			if (unsortedValues.length === 0) return;

			//click on a different column
			if (this.index !== th.index()) {
				this.direction = 'asc';
				this.index = th.index();
			}
			else if (direction !== 'asc' && direction !== 'desc')
				this.direction = this.direction === 'asc' ? 'desc' : 'asc';
			else
				this.direction = direction;

			direction = this.direction == 'asc' ? 1 : -1;

			self.$table.trigger('tablesort:start', [self]);
			self.log("Sorting by " + this.index + ' ' + this.direction);

			// Try to force a browser redraw
			self.$table.css("display");
			// Run sorting asynchronously on a timeout to force browser redraw after
			// `tablesort:start` callback. Also avoids locking up the browser too much.
			setTimeout(function() {
				self.$sortCells.removeClass(self.settings.asc + ' ' + self.settings.desc);
				for (var i = 0, length = unsortedValues.length; i < length; i++)
				{
					sortedMap.push({
						index: i,
						cell: cells[i],
						row: rows[i],
						value: unsortedValues[i]
					});
				}

				sortedMap.sort(function(a, b) {
					return self.settings.compare(a.value, b.value) * direction;
				});

				$.each(sortedMap, function(i, entry) {
					rowsContainer.append(entry.row);
				});

				th.addClass(self.settings[self.direction]);

				self.log('Sort finished in ' + ((new Date()).getTime() - start.getTime()) + 'ms');
				self.$table.trigger('tablesort:complete', [self]);
				//Try to force a browser redraw
				self.$table.css("display");
			}, unsortedValues.length > 2000 ? 200 : 10);
		},

		log: function(msg) {
			if(($.tablesort.DEBUG || this.settings.debug) && console && console.log) {
				console.log('[tablesort] ' + msg);
			}
		},

		destroy: function() {
			this.$sortCells.off('click.tablesort');
			this.$table.data('tablesort', null);
			return null;
		}

	};

	$.tablesort.DEBUG = false;

	$.tablesort.defaults = {
		debug: $.tablesort.DEBUG,
		asc: 'sorted ascending',
		desc: 'sorted descending',
		compare: function(a, b) {
			if (a > b) {
				return 1;
			} else if (a < b) {
				return -1;
			} else {
				return 0;
			}
		}
	};

	$.fn.tablesort = function(settings) {
		var table, sortable, previous;
		return this.each(function() {
			table = $(this);
			previous = table.data('tablesort');
			if(previous) {
				previous.destroy();
			}
			table.data('tablesort', new $.tablesort(table, settings));
		});
	};

})(window.Zepto || window.jQuery);


//var TDRTODAY = TDRTODAY || {};
var outhtml = '';

Date.initAsUTC = function(utc_datetime){ // https://qiita.com/watanuki_p/items/67eebb01c49837d563e4
	var local  = new Date(utc_datetime);
	var offset = -1 * local.getTimezoneOffset() / 60;
	var utc    = new Date(local.getTime() + (offset * 3600000));
	return utc;
}

function getfacilitiesconditions(){
	//console.log('getfacilitiesconditions');
	$.getJSON('/static/facilities_conditions.json',function(data){
		$.each(data, function(key, val){
			if(key == 'attractions'){
				$.each(val, function(key2, val2){
					var facilityCode = 0;
					var operatingStatus = '';
					var operatingStatusMessage = '';
					var facilityStatus = '';
					var facilityStatusMessage = '';
					var standbyTime = 0;
					var standbyTimeDisplayType = 0;
					var fastPassStatus = '';
					var fastPassStartAt = '';
					var fastPassEndAt = '';
					var startAt = '';
					$.each(val2, function(key3, val3){
						if(key3 == 'facilityCode'){
							facilityCode = val3;
						}else if(key3 == 'operatingStatus'){
							operatingStatus = val3;
						}else if(key3 == 'operatingStatusMessage'){
							operatingStatusMessage = val3;
						}else if(key3 == 'facilityStatus'){
							facilityStatus = val3;
						}else if(key3 == 'facilityStatusMessage'){
							facilityStatusMessage = val3;
						}else if(key3 == 'standbyTime'){
							standbyTime = val3;
						}else if(key3 == 'standbyTimeDisplayType'){
							standbyTimeDisplayType = val3;
						}else if(key3 == 'fastPassStatus'){
							fastPassStatus = val3;
						}else if(key3 == 'fastPassStartAt'){
							fastPassStartAt = val3;
						}else if(key3 == 'fastPassEndAt'){
							fastPassEndAt = val3;
						}else if(key3 == 'startAt'){
							startAt = val3;
						}
					});
					if(operatingStatus == 'OPEN'){
						if(standbyTimeDisplayType == 'NORMAL' && standbyTime >= 0){
							$('#attraction' + facilityCode + 'wt').html(standbyTime + '分').attr('data-sort-value', standbyTime);
						}else if(standbyTimeDisplayType == 'FIXED'){
							$('#attraction' + facilityCode + 'wt').html('非公開').attr('data-sort-value', -4);
						}else if(standbyTime >= 0){
							$('#attraction' + facilityCode + 'wt').html('(' + standbyTime + '分)').attr('data-sort-value', 0);
						}else{
							$('#attraction' + facilityCode + 'wt').html('-').attr('data-sort-value', -1);
						}
					}else if(operatingStatus == 'CLOSE_NOTICE'){ // 運営・公演中止
						$('#attraction' + facilityCode + 'wt').html(operatingStatusMessage).attr('data-sort-value', -2);
					}else if(facilityStatus == 'CANCEL'){ // 運営・公演中止
						$('#attraction' + facilityCode + 'wt').html(facilityStatusMessage).attr('data-sort-value', -3);
					}else if(operatingStatus == 'STANDBY'){
						var date = Date.initAsUTC(startAt);
						var min = date.getUTCMinutes();
						if(min < 10){
							min = '0' + min;
						}
						$('#attraction' + facilityCode + 'wt').html(operatingStatusMessage + '(' + date.getUTCHours() + ':' + min + '～)').attr('data-sort-value', 0);
					}
/*
					if(standbyTime > 0){
						$('#attraction' + facilityCode + 'wt').html(standbyTime + '分');
					}else if(operatingStatus == 'OPEN' && (standbyTimeDisplayType == 'NORMAL' || standbyTimeDisplayType == 'FIXED')){
						$('#attraction' + facilityCode + 'wt').html(standbyTime + '分');
					}else if(operatingStatus != 'OPEN' && facilityStatusMessage == '' && standbyTimeDisplayType != 'HIDE'){
						$('#attraction' + facilityCode + 'wt').html(standbyTime + '分<br>(' + operatingStatusMessage + ')');
					}else if(operatingStatus != 'OPEN' && facilityStatusMessage == '' && standbyTimeDisplayType == 'HIDE'){
						$('#attraction' + facilityCode + 'wt').html(operatingStatusMessage);
					}else if(operatingStatus == '' && facilityStatusMessage != '' && standbyTimeDisplayType == 'HIDE'){
						$('#attraction' + facilityCode + 'wt').html(facilityStatusMessage);
					}else{
						$('#attraction' + facilityCode + 'wt').html('-' + standbyTimeDisplayType);
					}
*/
					//console.log('attraction' + facilityCode, operatingStatus, standbyTimeDisplayType, standbyTime);

					if(fastPassStatus == 'NOT_TICKETING_TODAY'){
						$('#attraction' + facilityCode + 'fp').html('本日無し');
					}else if(fastPassStatus == 'TICKETING_END'){
						$('#attraction' + facilityCode + 'fp').html('発券終了');
					}else if(fastPassStatus == 'TICKETING'){
						$('#attraction' + facilityCode + 'fp').html(fastPassStartAt + '-' + fastPassEndAt);
					}else{
						$('#attraction' + facilityCode + 'fp').html('-');
					}
				});
			}else if(key == 'entertainments'){
				$.each(val, function(key2, val2){
					var facilityCode = 0;
					var operatingStatus = '';
					var operatingStatusMessage = '';
					$.each(val2, function(key3, val3){
						//console.log('3-entertainments', key3, val3);
						outhtml = '';
						if(key3 == 'facilityCode'){
							facilityCode = val3;
						}else if(key3 == 'operatingStatus'){
							operatingStatus = val3;
						}else if(key3 == 'operatingStatusMessage'){
							operatingStatusMessage = val3;
						}if(key3 == 'operatings'){
							$.each(val3, function(key4, val4){
								var startAt5 = '';
								var endAt5 = '';
								var operatingStatus5 = 0;
								var operatingStatusMessage5 = '';
								var hasLottery5 = 0;
								$.each(val4, function(key5, val5){
									//console.log('5-entertainments' + facilityCode, key3, key4, key5, val5);
									if(key5 == 'startAt'){
										startAt5 = val5;
									}else if(key5 == 'endAt'){
										endAt5 = val5;
									}else if(key5 == 'operatingStatus'){
										operatingStatus5 = val5;
									}else if(key5 == 'operatingStatusMessage'){
										operatingStatusMessage5 = val5;
									}else if(key5 == 'hasLottery'){
										hasLottery5 = val5;
									}
								});
								if(outhtml != ''){
									outhtml += '<br>';
								}
								if(startAt5 != ''){
									var startAt5date = Date.initAsUTC(startAt5);
									var startAt5min = startAt5date.getUTCMinutes();
									if(startAt5min < 10){
										startAt5min = '0' + startAt5min;
									}
									outhtml += startAt5date.getUTCHours() + ':' + startAt5min;
								}
								if(endAt5 != ''){
									var endAt5date = Date.initAsUTC(endAt5);
									var endAt5min = endAt5date.getUTCMinutes();
									if(endAt5min < 10){
										endAt5min = '0' + endAt5min;
									}
									outhtml += '～' + endAt5date.getUTCHours() + ':' + endAt5min;
								}
								if(hasLottery5){
									outhtml += '(抽選有り)';
								}
								if(operatingStatusMessage != ''){
									outhtml += '[' + operatingStatusMessage + ']';
								}
							});
						}
					});
					if(operatingStatusMessage != ''){
						$('#entertainments' + facilityCode + 'wt').html(operatingStatusMessage);
					}else if(outhtml != ''){
						$('#entertainments' + facilityCode + 'wt').html(outhtml);
					}
				});
			}
		});
	});
	$('.sortable.table').tablesort();
}
$(function(){
	$('.message .close').on('click', function(){
		$(this).closest('.message').transition('fade');
	});

	$('.sortable.table').tablesort();
	$('#menutdr').on('click',function(event){
		$('.parkTDL').show();
		$('.parkTDS').show();
	});
	$('#menutdl').on('click',function(event){
		$('.parkTDS').hide();
		$('.parkTDL').show();
	});
	$('#menutds').on('click',function(event){
		$('.parkTDL').hide();
		$('.parkTDS').show();
	});
	var parkcondition_TDLopen = 0;
	var parkcondition_TDLallNightDay = 0;
	var parkcondition_TDLmessage = '';
	var parkcondition_TDSopen = 0;
	var parkcondition_TDSallNightDay = 0;
	var parkcondition_TDSmessage = '';
	$.getJSON('/static/parks_conditions.json',function(data){
		$.each(data, function(key, val){
			if(key == 'schedules'){
				$.each(val, function(key2, val2){
					var parkType = '';
					var open = '';
					var allNightDay = '';
					$.each(val2, function(key3, val3){
						//console.log('schedules', key2, key3, val3);
						if(key3 == 'parkType'){
							parkType = val3;
						}else if(key3 == 'open'){
							open = val3;
						}else if(key3 == 'allNightDay'){
							allNightDay = val3;
						}
					});
					if(parkType == 'TDL'){
						parkcondition_TDLopen = open;
						parkcondition_TDLallNightDay = allNightDay;
					}else if(parkType == 'TDS'){
						parkcondition_TDSopen = open;
						parkcondition_TDSallNightDay = allNightDay;
					}
				});
			}else if(key == 'ticketSales'){
				$.each(val, function(key2, val2){
					var parkType = '';
					var message = '';
					$.each(val2, function(key3, val3){
						//console.log('ticketSales', key2, key3, val3);
						if(key3 == 'parkType'){
							parkType = val3;
						}else if(key3 == 'message'){
							message = val3;
						}
					});
					if(parkType == 'TDL'){
						parkcondition_TDLmessage = message;
					}else if(parkType == 'TDS'){
						parkcondition_TDSmessage = message;
					}
				});
			}
		});
		//console.log('TDL', parkcondition_TDLopen, parkcondition_TDLallNightDay, parkcondition_TDLmessage);
		//console.log('TDS', parkcondition_TDSopen, parkcondition_TDSallNightDay, parkcondition_TDSmessage);
		
		if(parkcondition_TDLopen && parkcondition_TDLmessage == 'ただいま東京ディズニーランドは、当日券の販売を行っております。'){
			parkcondition_TDL = 1;
		}else if(parkcondition_TDLopen){
			parkcondition_TDL = 2;
		}else{
			parkcondition_TDL = 3;
		}
		if(parkcondition_TDSopen && parkcondition_TDSmessage == 'ただいま東京ディズニーシーは、当日券の販売を行っております。'){
			parkcondition_TDS = 1;
		}else if(parkcondition_TDSopen){
			parkcondition_TDS = 2;
		}else{
			parkcondition_TDS = 3;
		}
		if(parkcondition_TDL == 1 && parkcondition_TDS == 1){
			
		}else{
			if(parkcondition_TDLopen && parkcondition_TDSopen){
				
			}else if(parkcondition_TDLopen){
				
			}else{
				
			}
		}
		if(parkcondition_TDLopen && parkcondition_TDSopen){
			$('#tdlparkclose').hide();
			$('#tdsparkclose').hide();
			$('#tdrparkclose').hide();
			$('#parkinfoarea').show();
		}else if(parkcondition_TDLopen){
			$('#tdsparkclose').hide();
			$('#tdrparkclose').hide();
			$('#tdlparkclose').show();
			$('#parkinfoarea').show();
		}else if(parkcondition_TDSopen){
			$('#tdlparkclose').hide();
			$('#tdrparkclose').hide();
			$('#tdsparkclose').show();
			$('#parkinfoarea').show();
		}else{
			$('#tdlparkclose').hide();
			$('#tdsparkclose').hide();
			$('#tdrparkclose').show();
			// $('#parkinfoarea').hide();
		}
	});


	if(location.hash == '#TDL'){
		$('.parkTDS').hide();
		$('.parkTDL').show();
	}else if(location.hash == '#TDS'){
		$('.parkTDS').show();
		$('.parkTDL').hide();
	}
	//if(!parkcondition_TDLopen && !parkcondition_TDSopen){
	//	$('#parkinfoarea').hide();
	//}
	//getfacilitiesconditions();
	setInterval('getfacilitiesconditions()', 60000);

});
