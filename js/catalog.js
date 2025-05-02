// Создаем класс PropertyCatalog - это как чертеж для нашего каталога
class PropertyCatalog {
    // constructor - это специальный метод, который запускается при создании нового каталога
    constructor() {
        // this.properties - массив для хранения всех объектов недвижимости
        // [] - пустой массив, в который мы будем добавлять данные
        this.properties = [];
        
        // this.filters - объект для хранения фильтров
        // {} - пустой объект, где мы храним текущие фильтры
        this.filters = {
            city: '',         // Фильтр по городу
            propertyType: '', // Фильтр по типу недвижимости
            dealType: ''      // Фильтр по типу сделки
        };
        
        // this.currentSort - строка, хранящая текущий тип сортировки
        this.currentSort = 'price-asc';
        
        // this.isLoading - флаг (true/false) для отслеживания загрузки
        this.isLoading = false;
        
        // Запускаем метод init() при создании каталога
        this.init();
    }

    // Метод инициализации каталога
    async init() {
        try {
            // Включаем индикатор загрузки
            this.setLoading(true);
            // Загружаем данные о недвижимости
            await this.loadProperties();
            // Настраиваем обработчики событий
            this.setupEventListeners();
            // Заполняем select'ы опциями
            this.renderFilterOptions();
            // Отображаем карточки недвижимости
            this.renderProperties();
        } catch (error) {
            console.error('Ошибка инициализации:', error);
        } finally {
            // Выключаем индикатор загрузки
            this.setLoading(false);
        }
    }

    // Метод для управления состоянием загрузки
    setLoading(loading) {
        this.isLoading = loading;
        // Находим все select'ы
        const selects = document.querySelectorAll('.menu__select');
        // Добавляем/убираем класс loading
        selects.forEach(select => {
            if (loading) {
                select.classList.add('loading');
            } else {
                select.classList.remove('loading');
            }
        });
    }

    // Метод загрузки данных из XML
    async loadProperties() {
        try {
            // Запрашиваем XML файл
            const response = await fetch('/xml/properties.xml');
            if (!response.ok) {
                throw new Error('Ошибка загрузки данных');
            }
            // Получаем текст XML
            const xmlText = await response.text();
            // Создаем парсер XML
            const parser = new DOMParser();
            // Парсим XML в документ
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
            
            // Получаем все элементы property
            const propertyElements = xmlDoc.getElementsByTagName('property');
            // Преобразуем XML в массив объектов
            this.properties = Array.from(propertyElements).map(prop => ({
                id: prop.getElementsByTagName('id')[0].textContent,
                title: prop.getElementsByTagName('title')[0].textContent,
                price: parseFloat(prop.getElementsByTagName('price')[0].textContent),
                address: prop.getElementsByTagName('address')[0].textContent,
                city: prop.getElementsByTagName('city')[0].textContent,
                type: prop.getElementsByTagName('type')[0].textContent,
                dealType: prop.getElementsByTagName('deal_type')[0].textContent,
                beds: parseInt(prop.getElementsByTagName('beds')[0].textContent),
                baths: parseInt(prop.getElementsByTagName('baths')[0].textContent),
                squareFootage: parseInt(prop.getElementsByTagName('square_footage')[0].textContent),
                image: prop.getElementsByTagName('image')[0].textContent
            }));
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            this.properties = [];
        }
    }

    // Метод настройки обработчиков событий
    setupEventListeners() {
        // Обработчик изменения select'а
        const handleSelectChange = async (select, filterType) => {
            // Показываем индикатор загрузки
            select.classList.add('loading');
            
            try {
                // Обновляем фильтры или сортировку
                if (filterType === 'sort') {
                    this.currentSort = select.value;
                } else {
                    this.filters[filterType] = select.value;
                }
                
                // Обновляем отображение
                await this.renderProperties();
            } finally {
                // Убираем индикатор загрузки
                setTimeout(() => {
                    select.classList.remove('loading');
                }, 300);
            }
        };

        // Навешиваем обработчики на select'ы
        document.getElementById('sortSelect').addEventListener('change', 
            (e) => handleSelectChange(e.target, 'sort'));

        const citySelect = document.getElementById('citySelect');
        citySelect.addEventListener('change', (e) => handleSelectChange(e.target, 'city'));

        const propertySelect = document.getElementById('propertySelect');
        propertySelect.addEventListener('change', (e) => handleSelectChange(e.target, 'propertyType'));

        const dealSelect = document.getElementById('dealSelect');
        dealSelect.addEventListener('change', (e) => handleSelectChange(e.target, 'dealType'));

        // Добавляем анимацию при наведении на select
        document.querySelectorAll('.menu__select').forEach(select => {
            select.addEventListener('mouseover', () => {
                select.style.transform = 'translateY(-2px)';
            });

            select.addEventListener('mouseout', () => {
                select.style.transform = 'translateY(0)';
            });
        });
    }

    // Метод заполнения select'ов опциями
    async renderFilterOptions() {
        // Показываем индикатор загрузки
        const selects = document.querySelectorAll('.menu__select');
        selects.forEach(select => select.classList.add('loading'));

        try {
            // Получаем уникальные города
            const cities = [...new Set(this.properties.map(prop => prop.city))];
            const citySelect = document.getElementById('citySelect');
            citySelect.innerHTML = '<option value="">По умолчанию</option>';
            
            // Добавляем города в select
            cities.forEach((city, index) => {
                const option = document.createElement('option');
                option.value = city;
                option.textContent = city;
                // Добавляем задержку для анимации
                setTimeout(() => {
                    citySelect.appendChild(option);
                }, index * 50);
            });

            // Получаем уникальные типы сделок
            const dealTypes = [...new Set(this.properties.map(prop => prop.dealType))];
            const dealSelect = document.getElementById('dealSelect');
            // dealSelect.innerHTML = '<option value="">Выберите тип сделки</option>';
            
            // Добавляем типы сделок в select
            dealTypes.forEach((type, index) => {
                const option = document.createElement('option');
                option.value = type;
                option.textContent = type[0].toUpperCase() + type.slice(1);
                setTimeout(() => {
                    dealSelect.appendChild(option);
                }, index * 50);
            });

        } catch (error) {
            console.error('Ошибка при рендеринге фильтров:', error);
        } finally {
            // Убираем индикатор загрузки
            setTimeout(() => {
                selects.forEach(select => select.classList.remove('loading'));
            }, 500);
        }
    }

    // Метод сортировки карточек
    sortProperties(properties) {
        const sortedProperties = [...properties];
        
        // Сортируем в зависимости от выбранного типа
        switch (this.currentSort) {
            case 'price-asc':  // По возрастанию цены
                return sortedProperties.sort((a, b) => a.price - b.price);
            case 'price-desc': // По убыванию цены
                return sortedProperties.sort((a, b) => b.price - a.price);
            default:
                return sortedProperties.sort((a, b) => a.title.localeCompare(b.title));
        }
    }

    // Метод фильтрации карточек
    filterProperties() {
        // filter - метод массива, который создает новый массив с элементами,
        // прошедшими проверку
        return this.properties.filter(property => {
            // Проверяем совпадение с каждым фильтром
            // || - логическое ИЛИ
            // ! - логическое НЕ
            const cityMatch = !this.filters.city || property.city === this.filters.city;
            const typeMatch = !this.filters.propertyType || property.type === this.filters.propertyType;
            const dealTypeMatch = !this.filters.dealType || property.dealType === this.filters.dealType;
            
            // Возвращаем true, если все проверки пройдены
            return cityMatch && typeMatch && dealTypeMatch;
        });
    }

    // Метод отображения карточек
    async renderProperties() {
        const propertyList = document.querySelector('.purchase__list');
        propertyList.style.opacity = '0';

        try {
            let filteredProperties = this.filterProperties();
            filteredProperties = this.sortProperties(filteredProperties);

            const propertyHTML = filteredProperties.map(property => `
                <div class="card ${property.dealType === 'аренда' ? 'card--rent' : 'card--sale'}">
                    <img class="card__image" src="${property.image}" alt="${property.title}" loading="lazy">
                    <div class="card__info">
                        <div class="card__info-main">
                            <div class="card__info-main-location">
                                <h4 class="card__info-main-location-title">${property.title}</h4>
                                <span class="card__info-main-location-price">${property.price.toLocaleString()} ₽</span>
                            </div>
                            <div class="card__info-main-address">
                                <img src="/img/location.svg" alt="location" class="card__info-main-address-image">
                                <span class="card__info-main-address-name">${property.address}</span>
                            </div>
                        </div>
                        <div class="card__info-footer">
                            <div class="card__info-footer-details">
                                <div class="card__info-footer-details-item">
                                    <img src="/img/bed.svg" alt="beds" class="card__info-footer-details-item-image">
                                    <span class="card__info-footer-details-item-name">${property.beds} спален</span>
                                </div>
                                <div class="card__info-footer-details-item">
                                    <img src="/img/bath.svg" alt="baths" class="card__info-footer-details-item-image">
                                    <span class="card__info-footer-details-item-name">${property.baths} ванных</span>
                                </div>
                                <div class="card__info-footer-details-item">
                                    <img src="/img/square.svg" alt="area" class="card__info-footer-details-item-image">
                                    <span class="card__info-footer-details-item-name">${property.squareFootage} м²</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <span class="card__label">${property.dealType === 'аренда' ? 'АРЕНДА' : 'ПРОДАЖА'}</span>
                </div>
            `).join('');

            await new Promise(resolve => {
                setTimeout(() => {
                    propertyList.innerHTML = propertyHTML;
                    propertyList.style.opacity = '1';
                    resolve();
                }, 300);
            });

        } catch (error) {
            console.error('Ошибка при рендеринге объектов:', error);
            propertyList.innerHTML = '<div class="error-message">Произошла ошибка при загрузке объектов</div>';
        }
    }
}

// Инициализация каталога при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new PropertyCatalog();
});