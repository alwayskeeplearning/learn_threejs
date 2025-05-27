import chokidar from 'chokidar';
import { spawn } from 'child_process';
import path from 'path';
import process from 'process'; // 显式导入 process 以解决 ESLint 问题

console.log('🔍 初始化监听脚本...');

let devProcess = null;
let restarting = false; // 防止在重启过程中重复触发

function killProcess(pid, signal = 'SIGTERM') {
  return new Promise((resolve, reject) => {
    try {
      process.kill(pid, signal);
      // 等待一小段时间确保进程被杀死
      setTimeout(() => {
        console.log(`🔪 进程 ${pid} 已发送 ${signal} 信号`);
        resolve();
      }, 200);
    } catch (e) {
      // 如果进程已经不存在，也认为是成功
      if (e.code === 'ESRCH') {
        console.log(`🤷 进程 ${pid} 已不存在`);
        resolve();
      } else {
        console.error(`❌ 杀死进程 ${pid} 失败:`, e);
        reject(e);
      }
    }
  });
}

async function startDevProcess() {
  if (devProcess && devProcess.pid) {
    if (restarting) {
      console.log('🔄 已经在重启中，请稍候...');
      return;
    }
    restarting = true;
    console.log(`🔪 正在停止旧的 dev 进程 (PID: ${devProcess.pid})...`);
    try {
      // 尝试优雅关闭，如果不行则强制杀死
      await killProcess(devProcess.pid, 'SIGINT'); // SIGINT 通常用于优雅关闭
      // 如果SIGINT后进程仍在，则使用SIGTERM
      if (devProcess && devProcess.pid) {
        await new Promise(resolve => setTimeout(resolve, 300)); // 等待一下
        if (devProcess && devProcess.pid) {
          // 再次检查
          console.log(`🔪 旧进程 ${devProcess.pid} 仍在，尝试 SIGTERM...`);
          await killProcess(devProcess.pid, 'SIGTERM');
        }
      }
    } catch {
      // 错误处理已在killProcess中完成
    }
    devProcess = null; // 清理旧进程引用
  }

  console.log('🚀 启动 "npm run dev"...');

  // 解析 'npm run dev' 命令
  // 'npm' on Windows is 'npm.cmd'
  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  devProcess = spawn(npmCmd, ['run', 'dev'], {
    stdio: 'inherit', // 这会将子进程的输出直接连接到父进程的输出
    shell: true, // 使用 shell 执行，这样 cross-env 等才能正常工作
    detached: false, // 在 *nix 系统上，如果为 true，则子进程将成为新进程组的领导者。
  });

  devProcess.on('spawn', () => {
    restarting = false; // 重启完成
    console.log(`✅ "npm run dev" 已启动 (PID: ${devProcess.pid})`);
  });

  devProcess.on('error', err => {
    restarting = false;
    console.error('❌ 启动 "npm run dev" 失败:', err);
    devProcess = null;
  });

  devProcess.on('exit', (code, signal) => {
    restarting = false;
    if (signal === 'SIGINT' || signal === 'SIGTERM') {
      console.log(`🏁 "npm run dev" 进程 (PID: ${devProcess ? devProcess.pid : 'N/A'}) 已被终止.`);
    } else if (code !== 0 && code !== null) {
      console.error(`❌ "npm run dev" 进程 (PID: ${devProcess ? devProcess.pid : 'N/A'}) 异常退出，退出码: ${code}`);
    } else if (code === 0) {
      console.log(`🏁 "npm run dev" 进程 (PID: ${devProcess ? devProcess.pid : 'N/A'}) 正常退出.`);
    }
    devProcess = null; // 清理进程引用
  });
}

const demosPath = path.resolve('demos'); // 获取demos文件夹的绝对路径
console.log(`📂 监听目录: ${demosPath} (及其子目录)`);

const watcher = chokidar.watch(demosPath, {
  ignored: filePath => {
    const relativePath = path.relative(demosPath, filePath);
    // 忽略 demos 根目录下的 .git 和 node_modules，以及所有子目录中的这些文件夹
    return /(^|[\\/])(\.git|node_modules)/.test(relativePath);
  },
  persistent: true,
  ignoreInitial: true, // 忽略初始扫描时的事件
  // awaitWriteFinish: { // 可选: 等待文件写入完成，对于大文件或慢速写入有用
  //   stabilityThreshold: 2000,
  //   pollInterval: 100
  // }
  depth: undefined, // 监听所有子目录, chokidar 默认行为
  // usePolling: true, // 如果在某些环境（如Docker, WSL）下不工作，可以尝试开启轮询，但性能较差
});

let debounceTimeout;
function handleFileEvent(event, filePath) {
  console.log(`🔔 事件: ${event}, 文件: ${path.relative(process.cwd(), filePath)}`);
  if (['add', 'unlink', 'addDir', 'unlinkDir'].includes(event)) {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(async () => {
      if (restarting) {
        console.log('🔄 事件触发，但正在重启中，已忽略。');
        return;
      }
      console.log('⏳ 触发重启 "npm run dev"...');
      await startDevProcess();
    }, 500); // 500ms 防抖
  } else if (event === 'change') {
    console.log('✏️  文件内容修改事件，已忽略。');
  }
}

watcher
  .on('add', filePath => handleFileEvent('add', filePath))
  .on('unlink', filePath => handleFileEvent('unlink', filePath))
  .on('addDir', filePath => handleFileEvent('addDir', filePath))
  .on('unlinkDir', filePath => handleFileEvent('unlinkDir', filePath))
  .on('change', filePath => handleFileEvent('change', filePath)) // 仍然监听，但仅记录
  .on('ready', () => {
    console.log('✅ Chokidar 监听器已就绪，等待文件系统变化...');
    // 脚本启动时先执行一次 npm run dev
    // console.log('🚀 首次启动 "npm run dev"...');
    startDevProcess(); // 取消首次启动，仅在文件变化时启动
  })
  .on('error', error => {
    console.error(`❌ Chokidar 监听错误: ${error}`);
  });

async function cleanupAndExit() {
  console.log('\\n🛑 正在清理并退出...');
  await watcher.close();
  if (devProcess && devProcess.pid) {
    console.log(`🔪 正在停止最后的 dev 进程 (PID: ${devProcess.pid})...`);
    try {
      await killProcess(devProcess.pid, 'SIGTERM');
    } catch {
      // 错误处理已在killProcess中完成
    }
  }
  console.log('👋 已退出。');
  process.exit(0);
}

process.on('SIGINT', cleanupAndExit); // Ctrl+C
process.on('SIGTERM', cleanupAndExit); // kill命令

// 初始启动一次 (如果需要的话)
// startDevProcess();
