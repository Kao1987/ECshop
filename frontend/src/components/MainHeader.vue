<template>
    <!-- 整體導航欄 -->
    <div class="header-container">
        <BNavbar toggleable="lg" type ="light" variant="light" class="navbar-overlay px-0">
        <BContainer fluid>
            <!-- 手機版選單的 Toggler 按鈕 -->
            <div class="headerbar d-flex align-items-center">
                <BNavbarToggle @click="toggleNav"></BNavbarToggle>
                <div v-if="!isNavOpen" class="nav-toggle-wrapper d-flex align-items-center ms-2 d-lg-none">
                    <img 
                    :src="$getImageUrl('arrowleft.png','icon')"
                    alt="導航提示" class="nav-toggle-image" @click="toggleNav"/>
                    <span class="nav-toggle-text ms-1">請點選此處開啟導航欄</span>
                </div>
            </div>
            <div class="nav-content">
                <!-- 導覽左 -->
                <div class="nav-left-wrapper">
                    <BCollapse id="nav-collapse" v-model="isNavOpen" is-nav>
                        <BNavbarNav class="nav-links">
                        <!-- 功能導航欄 -->
                        <div
                            v-for = "item in navItems"
                                :key="item.path"
                                :to="item.path"
                                class="nav-item-container"
                            >
                            <router-link 
                                :to="item.path" 
                                class="nav-link-text" 
                                @click="closeNav"
                                >
                                {{ item.text }}
                            </router-link>
                        </div>
                        </BNavbarNav>
                    </BCollapse>
                </div>
                <!-- 搜尋欄—置中 -->
                <div class="nav-center-wrapper">
                    <div class="search-container">
                        <div class="search-input-wrapper">
                            <BFormInput  
                            type="text" 
                            v-model="searchQuery" 
                            class="search-box" 
                            :placeholder="currentPlaceholder" 
                            @keyup.enter="handleSearch">
                            </BFormInput>
                            <BButton class="search-button btn btn-primary ms-2"  @click="handleSearch">
                                <span class="search-button-text">搜尋 </span>
                                <i class="fas fa-search search-icon"></i>
                            </BButton>
                        </div>
                    </div>
                </div>
                <!-- 導覽右—快捷 -->
                <div class="nav-right-wrapper">
                    <div class="cartmember d-flex align-items-center">
                        <router-link class="cart-item me-3" to="/ShopCart" @click="closeNav">
                            <img :src="$getImageUrl('shopping_cart.png','icon')" alt="" class="icon-img">
                            <span class="cart-text">購物車</span>
                        </router-link>
                        <template v-if="isLoggedIn">
                            <div class="member-item d-flex align-items-center">
                                <span class="cart-text welcome-text me-2">歡迎 {{ userName }}</span>
                                <button class="btn btn-link logout-btn" @click="logout">會員登出</button>
                            </div>
                        </template>
                        <template v-else>
                            <router-link class="member-item d-flex align-items-center" to="/UserLogin" @click="closeNav">
                                <img :src="$getImageUrl('member_login.png','icon')" alt="" class="icon-img">
                                <span class="cart-text">會員登入</span>                            
                            </router-link>
                        </template>
                    </div>
                </div>
            </div>
        </BContainer>
    </BNavbar>
</div>
</template>

<script>
export default {
    name: 'MainHeader',
    data(){
        return{
            searchQuery:'',
            isNavOpen:false,
            windowWidth:window.innerWidth,
            navItems: [
                { path: '/', text: '首頁' },
                { path: '/MembersPage', text: '會員中心' },
                { path: '/ProductsList', text: '產品列表' },
                { path: '/AboutUsPage', text: '關於我們' },
                { path: '/ContactUs', text: '聯絡我們' },
                { path: '/admin', text: '後台' }
            ] 
        };
    },
    computed:{
        isLoggedIn(){
            return this.$store.state.auth.isLoggedIn;
        },
        userName(){
            return this.$store.state.auth.user ? this.$store.state.auth.user.name:'';
        },
        currentPlaceholder(){
            return this.windowWidth < 576 ? '搜尋商品' : '請輸入想找的商品';
        }
    },
    methods:{
        handleSearch(){
            if(this.searchQuery.trim() !== ''){
                this.$router.push({
                path: '/ProductsList',
                query: { search: this.searchQuery.trim() }
            });
            this.closeNav();
            }
        },
        toggleNav(){
            this.isNavOpen = !this.isNavOpen;                
        },
        closeNav(){
            if(window.innerWidth < 992) {
                this.isNavOpen = false;
            }
        },        
        checkScreenSize(){
            if (window.innerWidth >= 992) {
            this.isNavOpen = true;
            } else {
            this.isNavOpen = false;
        }
        },
        handleResize(){
            this.windowWidth = window.innerWidth;
        },
        logout(){
            this.$store.dispatch('auth/logout');
            this.$router.push({path:'/'});
        }
    },
    mounted(){
        this.checkScreenSize();
        window.addEventListener('resize', this.handleResize);
    },
    beforeUnmount(){
        window.removeEventListener('resize', this.handleResize);
    },
    watch:{
        '$route'(){
            this.closeNav();
        }
    }
};
</script>
<style scoped>
@import 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';

.container-fluid{
    padding-right:0 !important;
    padding-left:0 !important;
    overflow: hidden;
}
.headerbar{
    position:relative;
}
.nav-toggle-text{
    margin-left:10px;
    font-size:14px;
    color:#cfcfcf;
}

.header-container{
    --header-bg-image:url('../assets/img/header_bg.jpg');
    background:var(--header-bg-image);
    background-size: cover;
    background-repeat: no-repeat;
    overflow: hidden;
    width: 100%;
}

.navbar-overlay{
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(5px);
    --bs-bg-opacity:0;
    width: 100%;
}

.nav-content {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    width: 100%;
    align-items: center;
    gap: 1rem;
}

.nav-left-wrapper {
    grid-column: 1;
    justify-self: start;
    width: auto;
}

.nav-center-wrapper {
    grid-column: 2;
    justify-self: center;
    width: 400px !important;
    max-width: 500px;
}

.nav-right-wrapper {
    grid-column: 3;
    justify-self: end;
    width: auto;
}

#nav-collapse {
    flex: none !important;
    width: auto !important;
}
.nav-links {
    flex: 0 0 auto;
    margin: 0;
    padding: 0;
    z-index: 2;
}
.nav-link-text{
    color:#ffffff;
    position: relative;
    text-decoration: none;
    cursor:pointer;
}
.nav-link-text::after {
    width: 100%;
    height: 2px;

}
.nav-item-container {
    padding: 0.5rem 0.8rem;
    white-space: nowrap;
    margin: 0 0.2rem;
    display: flex;
    align-items: center;
    position: relative;
    border-radius: 8px;
    transition: all 0.3s ease;
    cursor: pointer;
    
}

.nav-item-container:hover {
    background: linear-gradient(145deg, #ffffff, #f0f0f0);
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

/* 添加滑鼠懸停時的底線動畫效果 */
.nav-item-container::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 0;
    height: 2px;
    background: #0056b3;
    transition: all 0.3s ease;
    transform: translateX(-50%);
}

.nav-item-container:hover::after {
    width: 80%;
}

.nav-item-container.active {
    background: linear-gradient(145deg, #f0f0f0, #e6e6e6);
    color: #0056b3;
}

.nav-item-container:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.nav-link{
    margin-right: 50px;
}
.nav-link-text {
    transition: color 0.3s ease;
}

.nav-item-container:hover .nav-link-text {
    color: #0056b3;
}

.search-input-wrapper{
    position: relative;
    display: flex;
    width: 100%;
    max-width: 100%;
}
.search-box{
    border-radius:20px;
    padding:0 80px 0 15px;
    border: 2px solid #ddd;
    transition:all 0.3s ease;    
    height: 38px;
    width: 100%;
    min-width: 200px;
}
.search-box:focus{
    border-color: #0056b3;
    box-shadow:0 0 0 0.2rem rgba(0,86,179,0.25); 
}
.search-button{
    position: absolute;
    right: 0;
    top: 0;
    height: 100%;
    background-color:#0056b3;
    border-radius: 0 20px 20px 0;
    padding:0 1rem;
    transition: all 0.3s ease; 
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 60px;
}
.search-container{
    width: 100%;
    max-width: 500px;
    display: flex;
    justify-content: center;
}
.search-icon{
    display:none;
}
.cartmember{
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    width: 100%;
    justify-content: flex-end;
}
.cart-item{
    display: flex;
    align-items: center;
    padding: 0.5rem;
    color: #ffffff;
    text-decoration: none;
    transition: all 0.3s ease;
    border-radius: 20px;
    white-space: nowrap;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}
.member-item, .cart-item {
    white-space: nowrap;
    flex-shrink: 0;
}
.cart-item:hover{
    background-color: #2563b3;
    transform: translateY(-2px);
}
.icon-img{
    width:24px;
    height:24px;
    margin-right: 0.5rem;
    transition:transform 0.3s ease;    
}
.cart-item:hover .icon-img{
    transform: scale(1.1);
}
.member-item{
    display: flex;
    align-items: center;
    padding: 0.5rem;
    color: #ffffff;
    text-decoration: none;
    transition: all 0.3s ease;
    border-radius: 20px;
    white-space: nowrap;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    min-width: fit-content;
    flex-wrap:nowrap;
    gap:0.5rem;
}

.member-item:hover{
    background-color: #2563b3;
    transform: translateY(-2px);
}

.member-item{
    margin-right: 0.5rem;
}

.member-item .btn-link{
    color: #ffffff;
    text-decoration: none;
}

.member-item .btn-link:hover{
    color: #e6f3ff;
}
.member-info{
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    white-space: nowrap;
}
.welcome-text{
    margin-bottom:2px;
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;

}
.nav-toggle-image {
    margin-left: 10px;
    width: 24px; /* 根據需要調整大小 */
    height: 24px; /* 根據需要調整大小 */
    animation: blink 1.5s infinite;
    cursor: pointer;
}
.logout-btn{
    color:#ffffff !important;
    text-decoration: none;
    padding: 2px 8px !important;
    margin: 0;
    white-space: nowrap;
    font-size: 0.9rem;
    transition: all 0.3 ease;
    background-color: rgba (255,255,255,0.1);
    border-radius: 4px;
    min-width: max-content;
}
.logout-btn:hover{
    background-color: rgba (255,255,255,0.2);
    transform: translateY(-1px);
}

/* 新增的閃爍動畫 */
@keyframes blink {
    0%, 50%, 100% {
        opacity: 1;
    }
    25%, 75% {
        opacity: 0;
    }
}
/* -------RWD------- */

@media (min-width: 1200px) {
    .navbar-overlay {
        justify-content: space-between;
    }
    .nav-center-wrapper,
    .search-container {
        max-width: 600px; /* 針對特大螢幕額外增加寬度 */
    }
    .nav-content {
    display: grid;
    grid-template-columns: 1fr auto 1fr; /* 自動適應中間區域寬度變化 */
    width: 100%;
    align-items: center;
    gap: 1rem;
}
}
@media (min-width: 992px) {
    .nav-toggle-text{
        display:none;
    }
    .navbar-overlay{
        position:relative;
    }
    .search-container,
    .cartmember{
        flex-direction: row;
        align-items: center;
        flex-wrap: nowrap;
    }      
    .cartmember{
        white-space: nowrap;
    }
    .search-container {
        flex: 0 1 400px;
        margin: 0 auto;
        justify-content: center;
        align-items: center;
    }
}

@media (max-width: 991px) {
    .headerbar{
        justify-content: center;
        align-items: center;
    }
    .nav-links{
        align-items: center;
        justify-content: center;
        width: 100%;
        padding: 0;
    }
    .nav-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
    }
    
    .nav-left-wrapper, .nav-center-wrapper, .nav-right-wrapper {
        width: 100%;
        display: flex;
        justify-content: center;
        margin: 0.5rem 0;
    }
    
    .search-container {
        width: 90%;
        max-width: 400px;
    }
    
    .cartmember {
        flex-wrap: nowrap;
        width: auto;
    }
    
    #nav-collapse {
        width: 100% !important;
    }
}
@media (max-width: 576px) {
    .nav-links {
        justify-content: flex-start;
    }
    .cart-item {
        margin: 0.25rem 0.5rem;
    }
    .search-box {
        padding-right: 50px;
        font-size: 14px;
        min-width: 150px;
        width: 100%;
    }
    
    .search-button {
        padding: 0 0.75rem;
    }
    
    .search-button-text {
        display:none;
    }
    
    .search-icon {
        display: inline-block;
    }
    .search-container {
        margin: 0 4px;
        padding: 0 4px;
        width: 100%;
    }
    .welcome-text{
        display: none;
    }
    .logout-btn{
        padding: 4px 12px !important;
        font-size:0.85rem;
    }
    .nav-right{
        flex: 1;
        justify-content: center;
    }
}
@media (max-width: 375px) {
    .icon-img{
        margin-right: 0;
    }
    .nav-item-custom {
        font-size: 14px;
        margin: 0.25rem;
    }
    
    .search-container {
        flex-direction: row;
    }
    
    .search-button {
        position: absolute;
        margin-top: 0;
        width: auto;
        right: 0;
    }
    .search-box{
        padding-right: 40px;
    }
    .search-button{
        padding: 0 0.5rem;
    }
    .member-item{
        padding: 0.25rem;
    }
    .logout-btn{
        padding: 2px 8px !important;
        font-size:0.8rem;
    }
}
@media (min-width: 992px) and (max-width: 1200px) {
    .nav-content {
        max-width:100%;
        margin:0 0.5rem;
    }
    .cartmember {
        white-space: nowrap;
        flex:0 0 auto;
        min-width: fit-content;
    }
    .nav-links {
        flex-shrink: 1; /* 允許導航鏈接縮小以適應空間 */
    }
    .search-container {
        margin: 0 auto; /* 在兩側加一些間距 */
        max-width: 400px;
        min-width: 250px; /* 設置最小寬度 */
        flex:1 1 auto;
    }
    .nav-item-container {
        padding: 0.5rem 0.4rem;
    }
    /* 可能需要調整搜索框的樣式 */
    .search-input-wrapper {
        max-width: 100%; /* 允許搜索框完全縮小到容器寬度 */
    }
    .search-box {
        padding-right: 90px; /* 稍微減少右側內邊距 */
        width: 100%;
    }
    .search-button {
        padding: 0.375rem 1rem; /* 稍微減少按鈕的內邊距 */
    }
}




.cart-text {
    color: #ffffff;
    display: inline;
}


@media (max-width: 576px) {
    .cart-text {
        display: none;  /* 在手機尺寸下隱藏 */
    }
}

/* 確保文字不換行 */
.nav-link-text,
.cart-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

</style>