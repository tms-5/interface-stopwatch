<template>
  <div class="topbar">
    <img src="@/assets/logo.png" alt="Logo" class="logo" @click="$router.push('/')" />
  </div>
  <div class="app">
    <router-view />
  </div>
</template>

<style>
body {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  height: calc(100vh - 60px);
}

#app {
  font-family: Arial, sans-serif;
  text-align: center;
  margin-top: 50px;
  margin: auto;
  width: 100%;
  height: 100%;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  margin: 0;
  padding: 0;
}

.app {
  margin-top: 38px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: auto;
  position: relative;
  align-items: center;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 10px 0;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background: white;
  z-index: 1000;
}

.logo {
  height: 40px;
  cursor: pointer;
}

button {
  display: flex;
  padding: 8px 16px;
  line-height: 20px;
  font-size: 16px;
  border-radius: 24px;
  border: none;
  cursor: pointer;
  align-items: center;
}

button[small] {
  padding: 2px 8px;
  font-size: 12px;
  line-height: 16px;
  border-radius: 12px;
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

select {
  border: none;
  outline: 1px solid #cbd2db;
  transition: outline 0.2s ease-in-out;
  box-shadow: none;
  padding: 4px 8px;
  border-radius: 4px;
}
</style>