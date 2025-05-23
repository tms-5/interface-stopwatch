<template>
  <div class="topbar">
    <img src="@/assets/logo.png" alt="Logo" class="logo" />
  </div>
  <div class="app">
    <router-view />
  </div>
</template>

<style>
#app {
  font-family: Arial, sans-serif;
  text-align: center;
  margin-top: 50px;
  width: 50vw;
  margin: auto;
}

.app {
  margin-top: 70px;
  height: calc(100vh - 80px);
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  background-color: #f3f3f3;
  padding: 10px 0;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
}

.logo {
  height: 40px;
}

button {
  padding: 8px 16px;
  line-height: 20px;
  font-size: 16px;
  border-radius: 24px;
  border: none;
  cursor: pointer;
}

button[primary] {
  background-color: #1b1b96;
  color: white;
}

button[primary]:hover {
  background-color: #102063;
  color: white;
}

button[secondary] {
  background-color: white;
  outline: 1px solid #1b1b96;
  color: #1b1b96;
}

button[secondary]:hover {
  background-color: #e5f0ff;
}


.flex-buttons {
  display: flex;
  gap: 8px;
}

input[type="number"],
input[type="text"],
textarea {
  outline: 1px solid #cbd2db;
  border: none;
  height: 36px;
  border-radius: 4px;
  padding: 0 12px;
}

textarea {
  padding: 12px !important;
}

input[type="number"]:hover,
input[type="text"]:hover,
textarea:hover {
  outline: 1px solid #000050;
}

input[type="number"]:focus,
input[type="text"]:focus,
textarea:focus {
  outline: 1px solid #1b1b96;
  box-shadow: 0px 0px 0px 3px rgba(27, 27, 150, 0.26);
  ;
}
</style>