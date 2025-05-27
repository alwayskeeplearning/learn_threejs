/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-require-imports */

const chokidar = require('chokidar');
const { exec } = require('child_process');

let timeout;
function runDev() {
  if (timeout) clearTimeout(timeout);
  timeout = setTimeout(() => {
    console.log('🚀 执行 npm run dev');
    exec('npm run dev', (error, stdout, stderr) => {
      if (error) console.error('❌ 错误:', error.message);
      if (stdout) console.log(stdout);
      if (stderr) console.error(stderr);
    });
  }, 1000);
}

console.log('📂 开始监听demos文件夹的新增/删除事件...');

chokidar
  .watch('demos/**/*', {
    ignoreInitial: true, // 忽略初始扫描时的事件
    persistent: true,
    ignored: ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/build/**'],
  })
  .on('add', path => {
    console.log(`➕ 文件新增: ${path}`);
    runDev();
  })
  .on('unlink', path => {
    console.log(`🗑️  文件删除: ${path}`);
    runDev();
  })
  .on('addDir', path => {
    console.log(`📁 目录新增: ${path}`);
    runDev();
  })
  .on('unlinkDir', path => {
    console.log(`🗂️  目录删除: ${path}`);
    runDev();
  })
  .on('change', path => {
    // 明确记录但忽略修改事件
    console.log(`✏️  文件修改: ${path} (已忽略)`);
  })
  .on('ready', () => {
    console.log('✅ 监听器已就绪，等待文件新增/删除事件...');
  })
  .on('error', error => {
    console.error(`❌ 监听错误: ${error}`);
  });

// 优雅退出
process.on('SIGINT', () => {
  console.log('\n🛑 停止监听...');
  process.exit(0);
});
