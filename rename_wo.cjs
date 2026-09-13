const fs = require('fs');
let code = fs.readFileSync('resources/js/Pages/MonitoringOrder/Index.jsx', 'utf8');

code = code.replace(/>Monitoring Order/g, '>Monitoring Work Order');
code = code.replace(/Monitoring Order \|/g, 'Monitoring Work Order |');
code = code.replace(/>No\. Order</g, '>No. WO<');
code = code.replace(/>Tanggal Order</g, '>Tanggal WO<');
code = code.replace(/>Add New Order</g, '>Add New Work Order<');
code = code.replace(/>Create New Order</g, '>Create New Work Order<');
code = code.replace(/>Edit Order</g, '>Edit Work Order<');
code = code.replace(/>Update Order</g, '>Update Work Order<');
code = code.replace(/>Detail Order</g, '>Detail Work Order<');
code = code.replace(/placeholder="No\. Order"/g, 'placeholder="No. WO"');
code = code.replace(/placeholder="Tanggal Order"/g, 'placeholder="Tanggal WO"');
code = code.replace(/>Order By/g, '>Requested By');

fs.writeFileSync('resources/js/Pages/MonitoringOrder/Index.jsx', code);
