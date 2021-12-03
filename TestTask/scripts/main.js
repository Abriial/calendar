//Список пользователей
let users = [];
//Список задач
let tasks = [];
//Счетчик для подсчета задач в работе
let taskWorkCount = 0;

document.addEventListener("DOMContentLoaded", DocReady);
function DocReady() {
	//Загружаем данные
	GetUsersInfo();
}

function CreateCalendar() {
	//Обнуляем счётчик
	taskWorkCount = 0;
	//Очищаем блок
	var divUser = document.getElementById("div_users");
	divUser.innerHTML = "";
	//Добавляем столбец с пользователями
	users.forEach(function (user) {
		//Добавляем линию пользователя
		var userLine = document.createElement("div");
		userLine.id = "line:" + user.id;
		userLine.classList.add("user_line");
		
        //Добавляем блок пользователь в линию
        var userName = document.createElement("div");
        userName.id = user.id		
		userName.innerText = user.surname + "\n" + user.firstName;
		userName.classList.add("user_name");
		userLine.appendChild(userName);
		
		//Добавляем блоки дней 
		var dateList = document.getElementsByClassName("date");
		for (var i = 0; i < dateList.length; i++) {
			//Создаем новый блок и добавляем его на лайн
		    var dateItem = dateList[i];
			var day = document.createElement("div");
			day.id = dateItem.innerText + ":" + user.id;
			day.classList.add("day_block");
			
			//получаем текущий год
			var year = new Date().getFullYear();
			//Формируем дату
			var dayDate = dateItem.innerText.split('.');
	        var checkDate = new Date(year, Number(dayDate[1] - 1),dayDate[0]).toLocaleDateString("en-US");
			//Записываем дату и пользователя в атрибуты ячейки
			day.dataset.date = checkDate;
			day.dataset.user = user.id;
			
			//Добавляем задачи пользователя на лайн если она подходит
			tasks.forEach(function (task) {
				//Дата старта задачи
				var taskStartDate = new Date(task.planStartDate).toLocaleDateString("en-US");
				
				if (task.executor == user.id && taskStartDate == checkDate) {				
					//Прибавляес счетчик
					taskWorkCount++;
					var userTask = document.createElement("div");
					userTask.id = task.id;
					userTask.innerText = "Задача " + taskWorkCount;
					userTask.classList.add("user_task");
					
					//Атрибут передвижения
					userTask.setAttribute('draggable', true);
					
					//Добавляем всплывающее окно
				    userTask.dataset.info = "Тема: " + task.subject + "\nДата завершения: " + task.planEndDate; 
					if (task.description != null && task.description != "") {
						userTask.dataset.info += "\nОписание: " + task.description;
					}
										
					//Добавляем тему
					userTask.dataset.theme = task.subject;
					
					//Определяем просрок
					//Преобразуем дату
					var taskEndDate = new Date(task.planEndDate)
					userTask.dataset.dateEnd = taskEndDate;
					userTask.dataset.dateStart = taskStartDate;
					console.log(taskEndDate);
					console.log(checkDate);
					//Если срок сдачи задачи уже прошёл, то помечаем красным
					if (new Date(taskEndDate) > new Date(checkDate)) {
						userTask.style.background = "#ccffcc";
					}
					//Иначе помечаем зеленым
					else {
						userTask.style.background = "#ff8099";
					}
					
					//Добавляем задачу пользователю
					day.appendChild(userTask);
				}
			});	
			
			userLine.appendChild(day);
		}

        //Добавляем лайн пользователя в календарь
	    divUser.appendChild(userLine);
	});
}

//Заполняем календарь
function CalendarDate(date) {
	//Заполняем даты недели
	var dates = document.getElementsByClassName('date');
	for (var i = 0; i < dates.length; i++) {
		var newDate = new Date(date.setDate(date.getDate() + i));
		dates[i].innerText = newDate.getDate() + "." + (Number(newDate.getMonth()) + 1);
		
		//Сбрасываем дату
		date.setDate(date.getDate() - i);
	}
}

//Сменя недели
function SwapWeek(type) {
	var dates = document.getElementsByClassName('date');
	var now = new Date();
	//Получаем крайнюю левую дату
	var leftDate = dates[0].innerText.split('.');
	var date = new Date(now.getFullYear(), Number(leftDate[1] - 1), leftDate[0]);
	
	//тип
	if (type == 'prev') {
		var days = -7;
	}
	if (type == 'next') {
		var days = 7;
	}
	CalendarDate(new Date(date.setDate(date.getDate() + days)));
	CreateCalendar();
}


//Создаём Backlog
function BacklogCreate() {
	var div_backlog = document.getElementById('div_backlog');
	
	for(var i = 0; i < tasks.length; i++) {
		var task = tasks[i];
		
		//Если нет исполнителя, то добавляем в backlog
		if (task.executor == null) {
			var taskDiv = document.createElement("div");
			taskDiv.id = task.id;
			taskDiv.innerText = task.subject;
			taskDiv.classList.add("div_backlog_element");
			taskDiv.setAttribute('draggable', true);
			
			//Добавляем описание
			var title = "Тема: " + task.subject + "\nДата завершения: " + task.planEndDate; 
				if (task.description != null && task.description != "") {
					title += "\nОписание: " + task.description;
				}
			taskDiv.setAttribute('title', title);
			taskDiv.dataset.info = title;
			
			//Заносим дату окончания для последующей проверки
			taskDiv.dataset.dateEnd = new Date(task.planEndDate).toLocaleDateString("en-US");		
			taskDiv.dataset.dateStart = new Date(task.planStartDate).toLocaleDateString("en-US");	
			//Добавляем тему
			taskDiv.dataset.theme = task.subject;
			
			//Добавляем в бэклог
			div_backlog.appendChild(taskDiv);

		}
	}
	
	//Заполняем календарь
	var now = new Date();
	CalendarDate(now);	
	
	//Заполняем матрицу впервые
	CreateCalendar();
}

//Получение задач
function GetTasksInfo() {
	fetch('https://varankin_dev.elma365.ru/api/extensions/2a38760e-083a-4dd0-aebc-78b570bfd3c7/script/tasks')
		.then((res) => {
			return res.json();
		})
		.then((data) => {
			data.forEach((element) => {
				tasks.push(element);
			});			
			//Вызываем заполнение бэклога
			BacklogCreate();
		})
		.catch((err) => {
			console.log('Request error:' + err);
		});
}

//Получение пользователей
function GetUsersInfo() {
	fetch('https://varankin_dev.elma365.ru/api/extensions/2a38760e-083a-4dd0-aebc-78b570bfd3c7/script/users')
		.then((res) => {
			return res.json();
		})
		.then((data) => {
			data.forEach((element) => {
				users.push(element)
			});

			//Вызываем получение задач
			GetTasksInfo();
		})
		.catch((err) => {
			console.log('Request error' + err);
		});
}

//Функция поиска
function SearchTask(input) {
	var value = input.value.toLowerCase();
	//Фильтруем задачи бпз учета регистра
	var backlogTasks = document.getElementsByClassName("div_backlog_element");
	
	for (var i = 0;i < backlogTasks.length; i++)
	{
		if (backlogTasks[i].innerText.toLowerCase().indexOf(value) == -1) {
			backlogTasks[i].style.display = "none";
		}
		else { 
		    backlogTasks[i].style.display = "block";
		}
	}
}

//Обработка собитый передвижения
document.addEventListener("drag", function (evt) {
}, false);

document.addEventListener("dragstart", function (evt) {
    dragged = evt.target;
    evt.target.style.border = "solid 2px"
}, false);

document.addEventListener("dragend", function (evt) {
    evt.target.style.border = "solid 1px white";
}, false);

document.addEventListener("dragover", function (evt) {
    evt.preventDefault();
}, false);

document.addEventListener("dragenter", function (evt) {
    if (evt.target.className == "day_block") {		
		//Если срок сдачи задачи уже прошёл, то помечаем красным
		if (new Date(evt.target.dataset.date) > new Date(dragged.dataset.dateEnd)) {
			evt.target.style.background = "#ff8099";
		}
		
		//Иначе помечаем зеленым
		else {
			evt.target.style.background = "#ccffcc";
		}
    } else if (evt.target.className == "div_backlog") {
        evt.target.style.border = "solid 2px #d0e3f7";
    }
}, false);

document.addEventListener("dragleave", function (evt) {
    if (evt.target.className == "day_block") {
        evt.target.style.background = "";
    }
}, false);

document.addEventListener("drop", function (evt) {
    evt.preventDefault();

	//Переносим на календарь
    if (evt.target.className == "day_block") {
		if (dragged.parentNode.className == "div_backlog") {
			//Прибавляем счётчик
			taskWorkCount++;
			dragged.innerText = "Задача " + taskWorkCount;
		}
		
        dragged.parentNode.removeChild(dragged);
        evt.target.appendChild(dragged); 
		
		dragged.classList = "user_task";
		
		//Определяем цвет
		if (new Date(dragged.dataset.dateEnd) >= new Date(evt.target.dataset.date)) {
			dragged.style.background = "#ccffcc";
		}
		else {
			dragged.style.background = "#ff8099";
		}
		evt.target.style.background = "";
		
		//Добавляем исполнителя задачи и устанавливаем дату старта
		tasks.forEach(function (task) {
			if (task.id == dragged.id) {
				task.executor = evt.target.dataset.user;
				task.planStartDate = evt.target.dataset.date;
				return false;
			}
		});
        return;
    }
	
	if (evt.target.className == "user_name") {    
		if (dragged.parentNode.className == "div_backlog") {
			//Прибавляем счётчик
			taskWorkCount++;
			dragged.innerText = "Задача " + taskWorkCount;
		}
		
        //Получаем родительскую линию юзера
		dragged.parentNode.removeChild(dragged);
		var children = evt.target.parentNode.children;
		//Находим ячейку с нужной датой
		for (var i = 0; i < children.length; i++) {
			if (children[i].dataset.date == dragged.dataset.dateStart) {
				dragged.style.background = "#ccffcc";
				children[i].appendChild(dragged);
				dragged.classList = "user_task";				
							 
				//Добавляем исполнителя задачи и устанавливаем дату старта
				tasks.forEach(function (task) {
					if (task.id == dragged.id) {					
						task.executor = evt.target.id;
						//task.planStartDate = evt.target.dataset.date;
						return false;
					}
				});
				break;
			}
		}

        return;
    }
	
	//Возврат
	if (evt.target.className == "div_backlog") {  
        //Получаем родительскую линию юзера
		dragged.parentNode.removeChild(dragged);
		var children = evt.target.parentNode.children;
		//Меняем стиль
		dragged.innerText = dragged.dataset.theme;
		dragged.classList = "div_backlog_element";
		dragged.style.background = "";
		
		evt.target.appendChild(dragged);
		//Убавляем счётчик
		taskWorkCount--;
				 
		//Убираем исполнителя задачи и дату старта
		tasks.forEach(function (task) {
			if (task.id == dragged.id) {					
				task.executor = null;
				task.planStartDate = null;
				return false;
			}
		});
        return;
    }
	
}, false);