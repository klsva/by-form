import './styles/styles.scss'
import * as $ from 'jquery' 
import './img/polygon.png'
import './img/spinner.gif'

//отрисовка селектов
$('.select').each(function() {
    const _this = $(this),
        selectOption = _this.find('option'),
        selectOptionLength = selectOption.length,
        //selectedOption = selectOption.filter(':selected'),
        duration = 450; // длительность анимации 

    _this.hide();
    _this.wrap('<div class="select"></div>');
    $('<div>', {
        class: 'new-select',
        text: _this.children('option:disabled').text()
    }).insertAfter(_this);

    const selectHead = _this.next('.new-select');
    $('<div>', {
        class: 'new-select__list'
    }).insertAfter(selectHead);

    const selectList = selectHead.next('.new-select__list');
    for (let i = 1; i < selectOptionLength; i++) {
        $('<div>', {
            class: 'new-select__item',
            html: $('<span>', {
                text: selectOption.eq(i).text()
            })
        })
        .attr('data-value', selectOption.eq(i).val())
        .appendTo(selectList);
    }

    const selectItem = selectList.find('.new-select__item');
    selectList.slideUp(0);
    selectHead.on('click', function() {
        if ( !$(this).hasClass('on') ) {
            $(this).addClass('on');
            selectList.slideDown(duration);

            selectItem.on('click', function() {
                let chooseItem = $(this).data('value');

                $('select').val(chooseItem).attr('selected', 'selected');
                selectHead.text( $(this).find('span').text() );

                selectList.slideUp(duration);
                selectHead.removeClass('on');
            });

        } else {
            $(this).removeClass('on');
            selectList.slideUp(duration);
        }
    });
});


//обработка формы
document.addEventListener('DOMContentLoaded', function(){
    //перехватываем отправку формы и делаем ее сами
    const form = document.getElementById('form');
    //вешаем событие на форму
    form.addEventListener('submit', formSend);

    async function formSend(e){
        //запрещаем стандартную отправку формы
        e.preventDefault();

        let error = formValidate(form);

        //вытягиваем жанные из полей формы
        let formData = new FormData(form);
        //добавляем изображение
        formData.append('image', formImage.files[0]);

        //проверяем заполнены ли обязательные поля
        if (error === 0) {
            //сообщаем пользователю, что идет отправка формы
            form.classList.add('_sending');
            //ajax отпарка по скрипту sendmail.php
            let response = await fetch('sendmail.php', {
                method: 'POST',
                body: formData
            });
            //получаем ответ , успешна ли отправили, в ответ получаем json
            if (response.ok){
                let result = await response.json();
                alert(result.message);
                //очищаем форму
                formPreview.innerHTML = '';
                form.reset();
                form.classList.remove('_sending');
            } else {
                alert('Ошибка!')
                form.classList.remove('_sending')
            }
        } else {
            alert('Заполните обязательные поля');
            
        }
    }

    function formValidate(form){
        let error = 0;
        let formReq = document.querySelectorAll('._req');

        for (let index = 0; index < formReq.length; index++) {
            const input = formReq[index];
            //убираем класс эррор
            formRemoveError(input);

            //проверка email
            if (input.classList.contains('_email')){
                //проверяем емейл на корректность, если не ок, то добавляем класс эррор
                if (emailTest(input)){
                    formAddError(input);
                    error++;
                }
                //проверка наличия чекбокса
            } else if(input.getAttribute("type") === "checkbox" && input.checked === false){
                formAddError(input);
                error++;
                //проверяем заполнено ли поле вообще
            } else if (input.value === ''){
                formAddError(input);
                error++;
            }
        }
        return error;            
    }    

    /*ютилиты*/
    //добавляет объекту и родительскому объекту класс эррор    
    function formAddError(input){
        input.parentElement.classList.add('_error');
        input.classList.add('_error');
    }
    //убирает с объекта и с родительского объекта класс эррор
    function formRemoveError(input){
        input.parentElement.classList.remove('_error');
        input.classList.remove('_error');
    }
    //проверка емейла
    function emailTest(input){
        return !/^[A-Z0-9._%+-]+@[A-Z0-9-]+.+.[A-Z]{2,4}$/i.test(input.value);
    }
    //получаем input файл в переменную
    const formImage = document.getElementById('formImage');
    //получаем див для превью в переменную
    const formPreview = document.getElementById('formPreview');
    //слушаем изменение в input file
    formImage.addEventListener('change', () => {
        uploadFile(formImage.files[0]);
    });

    //функция загрузки файла
    function uploadFile(file){
        //проверяем тип файла
        if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)){
            alert('Разрешены только изображения.');
            formImage.value = '';
            return;
        }
        //проверяем размер файла
        if (file.size > 2 * 1024 * 1024){
            alert('Файл должен быть менее 2 МБ.');
            return;
        }

        //превью файла
        var reader = new FileReader();
        reader.onload = function(e) {
            formPreview.innerHTML = `<img src="${e.target.result}" alt="Фото">`;
        };
        reader.onerror = function (e){
            alert('ошибка');
        };
        reader.readAsDataURL(file);
    }

})