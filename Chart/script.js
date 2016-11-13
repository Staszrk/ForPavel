var Chart = function(id)
{
	//Data Struct
	var datas = {
		//Доступ к нашему Canvas'у
		"object": 
		{
			//Объект через нативный JS
			"jNative": null,
			//Объект через jQuery
			"jQuery": null
		},
		//Сами элементы, данные и настройки графика
		"graph": {
			//Сам график (его объект)
			"context": null,
			//Размеры области графика
			"size": {
				"height":	0,
				"width":	0
			},
			//Масштаб
			"scale": {
				"height":	0,
				"width":	0
			},
			//Указывает откуда начинать рисовать
			"start": {
				"x": 0,
				"y": 0
			}
		},
		"points": {
			//Точки, которые поступили к нам при создании объекта класса
			"global": {
				//Массив стандартных точек
				"array": {
					"x": null,
					"y": null
				},
				//Максимальные точки
				"max": {
					"x": 0,
					"y": 0
				},
				//Минимальные точки
				"min": {
					"x": 0,
					"y": 0
				},
				//Общее количество
				"count": {
					"x": 0,
					"y": 0
				},
        //Все точки в одном месте
				"all": {
					"x": [],
					"y": [],
					"values": []
				}
			},
			//Точки которые будут отрисовываться
			"data":[{
				"x": 0,
				"y": 0,
				"value": 0
			}],
			//Точки которые служат для рисования кривой линии
			"interpolation": {
				//До интероллирования
				"before": [],
				//После интерполирования
				"after": []
			}
		},
		"columns": [{
			//Заголовок колонки
			"title": "",
			//Начало колонки
			"start": 0,
			//Конец колонки
			"end": 0,
			//Точки, необходимы для перерисовки и проверке где находится мышка
			"points": [],
		}],
		"data": null
	};
	
	//Реализация построения графика с помощью сплайнов
	//Переписанный алгоритм кубического сплайна 
	//https://ru.wikipedia.org/wiki/Кубический_сплайн
	var Spline = {
		build: function(arrays) {
			let splines = new Array();
			for (let i = 0; i < arrays.length; ++i)
			{
				splines.push({
					x: arrays[i].x,
					a: arrays[i].y,
					b: 0,
					c: 0,
					d: 0
				});
			}
			splines[0].c = splines[arrays.length - 1].c = 0.0;
			
			let alpha = new Array(arrays.length - 1);
			let beta = new Array(arrays.length - 1);
			alpha[0] = beta[0] = 0.0;
			for (let i = 1; i < arrays.length - 1; ++i)
			{
				let hi  = arrays[i].x - arrays[i - 1].x;
				let hi1 = arrays[i + 1].x - arrays[i].x;
				let A = hi;
				let C = 2.0 * (hi + hi1);
				let B = hi1;
				let F = 6.0 * ((arrays[i + 1].y - arrays[i].y) / hi1 - (arrays[i].y - arrays[i - 1].y) / hi);
				let z = (A * alpha[i - 1] + C);
				alpha[i] = -B / z;
				beta[i] = (F - A * beta[i - 1]) / z;
			}
			// Нахождение решения - обратный ход метода прогонки
			for (let i = arrays.length - 2; i > 0; --i)
				splines[i].c = alpha[i] * splines[i + 1].c + beta[i];

			// По известным коэффициентам c[i] находим значения b[i] и d[i]
			for (let i = arrays.length - 1; i > 0; --i)
			{
				let hi = arrays[i].x - arrays[i - 1].x;
				splines[i].d = (splines[i].c - splines[i - 1].c) / hi;
				splines[i].b = hi * (2.0 * splines[i].c + splines[i - 1].c) / 6.0 + (arrays[i].y - arrays[i - 1].y) / hi;
			}
			return splines;
		},
		interpolate: function(splines, x) {
			if (splines == null)
				return null; // Если сплайны ещё не построены - возвращаем NaN
			
			let n = splines.length;
			let s;
			if (x <= splines[0].x) // Если x меньше точки сетки x[0] - пользуемся первым эл-тов массива
				s = splines[0];
			else if (x >= splines[n - 1].x) // Если x больше точки сетки x[n - 1] - пользуемся последним эл-том массива
			{
				s = splines[n - 1];
			}
			else // Иначе x лежит между граничными точками сетки - производим бинарный поиск нужного эл-та массива
			{
				let i = 0;
				let j = n - 1;
				while (i + 1 < j)
				{
					let k = i + (j - i) / 2;
					if (x <= splines[parseInt(k)].x)
					{
						j = k;
					}
					else
					{
						i = k;
					}
				}
				s = splines[parseInt(j)];
			}
			let dx = x - s.x;
			// Вычисляем значение сплайна в заданной точке по схеме Горнера (в принципе, "умный" компилятор применил бы схему Горнера сам, но ведь не все так умны, как кажутся)
			return s.a + (s.b + (s.c / 2.0 + s.d * dx / 6.0) * dx) * dx; 
		}
	};
	//Получения точки по разным осям
  //с учетом начальной точки и размера области для рисования
	var Axis = {
		x: function(value, overflow = false) {
			let xVal = datas.graph.start.x + value * datas.graph.scale.width;
			if (xVal > datas.graph.size.width)
				xVal = datas.graph.size.width;
			else if (xVal < 0 && !overflow)
				xVal = 0;
			
			return xVal;
		},
		y: function(value, overflow = false) {
			let yVal = datas.graph.start.y - value * datas.graph.scale.height;
			if (yVal > datas.graph.size.height)
				yVal = datas.graph.size.height;
			else if (yVal < 0 && !overflow)
				yVal = 0;
			
			return yVal;
		}
	};
	
	var isNullable = function(data) {
		if(data == undefined) return false;
		if(data == null) return false;
		return true;
	};
	
  //Работа с точками
	var Points = {
		max: function() {
			//Максимальные точки по всем осям
			let struct = {
				x: 0,
				y: 0
			};
			//Get Max in X
			//Для этого созданим еще один массив, в котором будут только числа
			let numsArray = [];
			//Заполним массив только числами
			$.each(datas.points.global.array.x, function(prop, value) {
				if(!isNaN(value))
					numsArray.push(value);

				if(numsArray.length > 0)
					struct.x = Math.max.apply(null, numsArray);
			});
			
			//Get Max in Y
			$.each(datas.points.global.array.y, function(prop, value) {
				if(struct.y < Math.max.apply(null, value))
					struct.y = Math.max.apply(null, value);
			});
			//+10 для того, чтобы график не доходил до краев
			struct.y += 10;
			return struct;
		},
		min: function() {
			//Минимальные точки по всем осям
			let struct = {
				x: 0,
				y: 0
			};
			//Get Min in X
			//Для этого созданим еще один массив, в котором будут только числа
			let numsArray = [];
			//Заполним массив только числами
			$.each(datas.points.global.array.x, function(prop, value) {
				if(!isNaN(value))
					numsArray.push(value);
				//Если у нас есть что-нибудь в массиве, тогда изем максимальное число
				if(numsArray.length > 0)
					struct.x = Math.min.apply(null, numsArray);
			});
			//Get Min in Y
			$.each(datas.points.global.array.y, function(prop, value) {
				if(struct.y < Math.min.apply(null, value))
					struct.y = Math.min.apply(null, value);
			});
			return struct;
		},
		count: function() {
			//Количество всех точек
			let counts = {
				x: 0,
				y: 0
			}
			for(let i = 0; i < datas.points.global.array.y.length; i++)
				counts.y += datas.points.global.array.y[i].length;
			counts.x = datas.points.global.array.x.length
			return counts;
		},
		all: function() {
			//Все точки в одном месте
			let _all = {
				x: [],
				y: [],
				values: []
			};
			for(let i = 0; i < datas.points.global.array.y.length; i++)
				for(let k = 0; k < datas.points.global.array.y[i].length; k++){
					_all.y.push(datas.points.global.array.y[i][k]);
					_all.values.push(datas.points.global.array.y[i][k]);
				}
			for(let i = 0; i < datas.points.global.array.x.length; i++)
					_all.x.push(parseFloat(datas.points.global.array.x[i]));
				
			if(_all.x.includes(NaN))
			{
				_all.x = new Array();
				let scale = options.scale.step.size;
				for(let block = 0; block < datas.points.global.array.x.length && block < datas.points.global.array.y.length; block++)
				{
					for(let point = 0; point < datas.points.global.array.y[block].length; point++)
					{
						_all.x.push(scale);
						scale += options.scale.step.size;
					}
					scale += options.scale.step.size;
				}
			}
			datas.points.global.all = _all;
		},
		before: function() {
			//Заполнение данными до интероллирования
			let scale = 0;
			let column = {
				title: "",
				start: 0,
				end: 0,
				points: []
			};
			datas.points.interpolation.before = new Array();
			datas.columns = new Array();
			
			datas.points.interpolation.before.push({
				x: 	0,
				y:	datas.points.global.array.y[0][0]
			});
			scale += options.scale.step.size;
			
			for(let block = 0; block < datas.points.global.array.x.length && block < datas.points.global.array.y.length; block++)
			{
				for(let point = 0; point < datas.points.global.array.y[block].length; point++)
				{
					datas.points.interpolation.before.push({
						x: 	scale,
						y:	datas.points.global.array.y[block][point]
					});
					scale += options.scale.step.size;
				}
				//Заполняем колонки данными (кроме точек)
				datas.columns.push({
					start: !isNullable(datas.columns[datas.columns.length - 1]) ? 0 : datas.columns[datas.columns.length - 1].end,
					end: Axis.x(scale),
					title: datas.points.global.array.x[block],
					points: []
				});
				scale += options.scale.step.size;
			}
			
			datas.points.interpolation.before.push({
				x: 	scale,
				y:	datas.points.global.array.y[datas.points.global.array.y.length - 1][datas.points.global.array.y[datas.points.global.array.y.length - 1].length - 1]
			});
		},
		after: function() {
			//Интерполирование
			datas.points.interpolation.after = new Array();
			datas.points.interpolation.after.push({
				x:	Axis.x(-5, true),
				y:	Axis.y(0)
			});
			let splineArray = Spline.build(datas.points.interpolation.before);
			let afterStruct;
			for (let k = datas.points.interpolation.before[0].x; k <= datas.points.interpolation.before[datas.points.interpolation.before.length - 1].x; k += 0.1)
			{
				afterStruct = {
					x: Axis.x(parseFloat(k.toFixed(2))),
					y: Axis.y(Spline.interpolate(splineArray, parseFloat(k.toFixed(2))))
				};

				datas.points.interpolation.after.push({
					x:	afterStruct.x,
					y:	afterStruct.y
				});
				
				for(let i = 0; i < datas.columns.length; i++)
					if(datas.columns[i].start <= afterStruct.x && afterStruct.x <= datas.columns[i].end) {
						datas.columns[i].points.push({
							x: afterStruct.x,
							y: afterStruct.y
						});
						break;
					}
			}
			datas.points.interpolation.after.push({
				x:	Axis.x(datas.points.interpolation.before[datas.points.interpolation.before.length - 1].x + 5),
				y:	Axis.y(0)
			});
		},
		data: function() {
			datas.points.data = new Array();
			for(let point = 0; point < datas.points.global.all.x.length && point < datas.points.global.all.y.length; point++)
			{
				datas.points.data.push({
					x: Axis.x(datas.points.global.all.x[point]),
					y: Axis.y(datas.points.global.all.y[point]),
					value: datas.points.global.all.values[point]
				});
			}
		}
	};

	//Функция для заполнения созданной структуры
	var create = function(data, options) {
		
		//---------------	OBJECT
		//Присваивание свойств для работы с объектами
		
		//Присваиваем нативный объект переменной в структуре
		datas.object.jNative = document.getElementById(id);
		
		//Присваиваем jQuery объект переменной в структуре
		datas.object.jQuery = $("#" + id);
		
		//---------------	POINTS
		//Заполнения global - массива точками, которые были переданы в функцию
		
		//Присваиваем массив Y точек нашей переменной в структуре
		datas.points.global.array.y = data.value;
		
		//Присваиваем массив X точек нашей переменной в структуре
		datas.points.global.array.x = data.labels;
		
		//Находим максимальные точки
		datas.points.global.max = Points.max();
		
		//Находим минимальные точки
		datas.points.global.min = Points.min();
		
		//Находим количество точек
		datas.points.global.count = Points.count();
		
		//--------------- 	GRAPH
		//Присваивание значений переменным graph для работы с: размерами, масштабами, начальной точкой
		//Также для рисования через контекст канвас-объекта
		
		//Присваиваем контекст канваса переменной (через нее будет происходить отрисовка)
		datas.graph.context = datas.object.jNative.getContext("2d");
		
		//Размеры рабочей области (чтобы постоянно не делать пересчет)
		datas.graph.size =  {
			height:	parseInt(datas.object.jQuery.attr("height")),
			width: parseInt(datas.object.jQuery.attr("width"))
		};
		
		//Масштабы
		datas.graph.scale =  {
			width:	datas.graph.size.width / ((datas.points.global.count.y + 3) * options.scale.step.size),
			height:	datas.graph.size.height / (datas.points.global.max.y - 0)
		};
		
		//Начальная точка
		datas.graph.start =  {
			x: parseInt((isNaN(data.startPoint) ? 0 : data.startPoint.x) * datas.graph.scale.width),
			y: parseInt(datas.points.global.max.y * datas.graph.scale.height)
		};
		
		//--------------- 	POINTS [BEFORE]
		//Заполнение массива точек, точками до интреполирования
		Points.before();
		
		//--------------- 	POINTS INTERPOLATION [AFTER]
		//Делаем интерполяцию
		Points.after();
		
		//Заполняем массивы точками. В данных массивах точки будут хранится поячеесто.
		Points.all();
		
		//--------------- 	POINTS DATA
		//Заполняем массив для отрисовки указанных точек
		Points.data();
		
	};
	return {
		ColumnLine : function(data, options) {
			create(data, options);
			let context = datas.graph.context;
			
			//Рисуем линию
			context.beginPath();
			context.moveTo(datas.points.interpolation.after[0].x, datas.points.interpolation.after[0].y);
			for(let point = 1; point < datas.points.interpolation.after.length; point++){
				try {
					context.lineTo(datas.points.interpolation.after[point].x.toFixed(5), datas.points.interpolation.after[point].y.toFixed(5));
				}
				catch(err) { 
					console.log(err);
				}
			}
			context.fillStyle = options.style.chart.fill;
			context.fill();
			context.lineWidth = 4;
			context.strokeStyle = options.style.chart.stroke;
			context.stroke();
			context.shadowColor = '#212121';
			context.shadowBlur = 8;
			context.shadowOffsetX = 0;
			context.shadowOffsetY = 2;
			context.closePath();
			
		
			//Рисуем точки
			for(let point = 0; point < datas.points.data.length; point++)
			{
				context.beginPath();
				context.arc(datas.points.data[point].x, datas.points.data[point].y, options.style.point.size, 0, 2 * Math.PI);
				context.fillStyle = options.style.point.fill;
				context.fill();
				context.lineWidth = 4;
				context.strokeStyle = options.style.point.stroke;
				context.stroke();
				context.closePath();
			}
		}
	};
};
	
var data = {
	labels:	["Грудь", "Бицепс", "Ноги"],
	value: 	[
				[24, 23, 12],
				[14, 16, 16],
				[7, 7.5, 11]
			],
	startPoint: {
		x: 0
	}
	
};
var options = {
	style:	{
		chart: {
			stroke: "#2196f3",
			fill:	"rgba(33, 150, 243, 0.18)"
		},
		point:	{
			stroke: "#2196f3",
			fill:	"#363844",
			size:	10
		}
	},
	curve:	true,
	scale:	{
		step: 	{
			//Размер в значениях между каждым шагом
			size:	5
		}
	}
}

let user = new Chart('statis_chart').ColumnLine(data, options);
