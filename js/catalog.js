class PropertyCatalog {
    constructor() {
        this.properties = [];
        this.filters = {
            city: '',
            propertyType: '',
            dealType: ''
        };
        this.currentSort = 'price-asc';
        this.isLoading = false;
        
        this.init();
    }

    async init() {
        try {
            this.setLoading(true);
            await this.loadProperties();
            this.setupEventListeners();
            this.renderFilterOptions();
            this.renderProperties();
        } catch (error) {
            console.error('Ошибка инициализации:', error);
        } finally {
            this.setLoading(false);
        }
    }

    setLoading(loading) {
        this.isLoading = loading;
        const selects = document.querySelectorAll('.menu__select');
        selects.forEach(select => {
            if (loading) {
                select.classList.add('loading');
            } else {
                select.classList.remove('loading');
            }
        });
    }

    async loadProperties() {
        try {
            const response = await fetch('/xml/properties.xml');
            if (!response.ok) {
                throw new Error('Ошибка загрузки данных');
            }
            const xmlText = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
            
            const propertyElements = xmlDoc.getElementsByTagName('property');
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

    setupEventListeners() {
        const handleSelectChange = async (select, filterType) => {
            select.classList.add('loading');
            
            try {
                if (filterType === 'sort') {
                    this.currentSort = select.value;
                } else {
                    this.filters[filterType] = select.value;
                }
                
                await this.renderProperties();
            } catch (error) {
                console.error('Ошибка при обновлении:', error);
            } finally {
                setTimeout(() => {
                    select.classList.remove('loading');
                }, 300);
            }
        };

        // Обработчик сортировки
        const sortSelect = document.getElementById('sortSelect');
        sortSelect.addEventListener('change', (e) => handleSelectChange(e.target, 'sort'));

        // Обработчик фильтра по городу
        const citySelect = document.getElementById('citySelect');
        citySelect.addEventListener('change', (e) => handleSelectChange(e.target, 'city'));

        // Обработчик фильтра по типу недвижимости
        const propertySelect = document.getElementById('propertySelect');
        propertySelect.addEventListener('change', (e) => handleSelectChange(e.target, 'propertyType'));

        // Обработчик фильтра по типу сделки
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

    async renderFilterOptions() {
        const selects = document.querySelectorAll('.menu__select');
        selects.forEach(select => select.classList.add('loading'));

        try {
            // Заполняем select городов
            const cities = [...new Set(this.properties.map(prop => prop.city))];
            const citySelect = document.getElementById('citySelect');
            citySelect.innerHTML = '<option value="">Выберите город</option>';
            
            cities.forEach((city, index) => {
                const option = document.createElement('option');
                option.value = city;
                option.textContent = city;
                // Добавляем задержку появления для анимации
                setTimeout(() => {
                    citySelect.appendChild(option);
                }, index * 50);
            });

            // Заполняем select типов сделок
            const dealTypes = [...new Set(this.properties.map(prop => prop.dealType))];
            const dealSelect = document.getElementById('dealSelect');
            dealSelect.innerHTML = '<option value="">Выберите тип сделки</option>';
            
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

    sortProperties(properties) {
        const sortedProperties = [...properties];
        
        switch (this.currentSort) {
            case 'price-asc':
                return sortedProperties.sort((a, b) => a.price - b.price);
            case 'price-desc':
                return sortedProperties.sort((a, b) => b.price - a.price);
            default:
                return sortedProperties.sort((a, b) => a.title.localeCompare(b.title));
        }
    }

    filterProperties() {
        return this.properties.filter(property => {
            const cityMatch = !this.filters.city || property.city === this.filters.city;
            const typeMatch = !this.filters.propertyType || property.type === this.filters.propertyType;
            const dealTypeMatch = !this.filters.dealType || property.dealType === this.filters.dealType;
            return cityMatch && typeMatch && dealTypeMatch;
        });
    }

    async renderProperties() {
        const propertyList = document.querySelector('.purchase__list');
        propertyList.style.opacity = '0';

        try {
            let filteredProperties = this.filterProperties();
            filteredProperties = this.sortProperties(filteredProperties);

            const propertyHTML = filteredProperties.map(property => `
                <div class="card">
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
                    <span class="card__label">${property.dealType === 'продажа' ? 'ПРОДАЖА' : 'АРЕНДА'}</span>
                </div>
            `).join('');

            // Анимированное обновление списка
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

// Инициализация каталога при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    new PropertyCatalog();
});