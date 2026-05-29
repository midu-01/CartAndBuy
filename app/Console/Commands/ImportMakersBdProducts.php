<?php

namespace App\Console\Commands;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

#[Signature('products:import-makersbd {--clear : Delete all existing products, brands and categories first}')]
#[Description('Import all products from makersbd.com into the database')]
class ImportMakersBdProducts extends Command
{
    /** @var array<string> */
    private array $productUrls = [
        'https://makersbd.com/product/12-colour-cable-set-1-meter',
        'https://makersbd.com/product/dt3-data-cable-detection-board-faulty-usb-cable-checker-for-ios-android-type-c-easy-and-high-quality-121',
        'https://makersbd.com/product/22.5w-qc4.0-qc3.0-power-bank-module-type-c-dual-usb-ip5328-input-3.7v-117',
        'https://makersbd.com/product/4s-100a-3.2v-lithium-ion-phosphate-bms-with-balanced-protection-board-109',
        'https://makersbd.com/product/pd-65w-fast-charging-module-usb-type-c-interface-supports-pd3.1-qc3.0-scp-pps-power-bank-module-5v-9v-12v-20v-96',
        'https://makersbd.com/product/dc-5v-to-9-12v-usb-step-up-boost-converter-cable-with-3.5x1.35mm-connector-for-power-supply-charger-power-converter',
        'https://makersbd.com/product/high-quality-sharp-probe-cable-1000v-20a-smd-smt-needle-tip-gold-plated-sharp-pen-88',
        'https://makersbd.com/product/samsung-14-volt-3a-ac-dc-adapter-56w-smps-power-supply-switching-mode-87',
        'https://makersbd.com/product/ws2812-5050-smd-led-matrix-rgb-8x8-64-neomatrix-display-for-arduino',
        'https://makersbd.com/product/150w-dc-ac-inverter-12v-220v-step-up-power-supply-module',
        'https://makersbd.com/product/12v-battery-voltage-and-power-display-integrated-with-dual-usb-output-5v-2a-charger-75',
        'https://makersbd.com/product/battery-charge-level-indicator-12v-84v',
        'https://makersbd.com/product/analog-panel-voltmeter-0-300v-range-ac-220v-volt-display-168',
        'https://makersbd.com/product/liitokala-engineer-lii-500-18650-lithium-battery-capacity-tester-162',
        'https://makersbd.com/product/3s-12.6v-lithium-battery-level-capacity-indicator-display-full-charge-12.6v-blue-and-red-display-151',
        'https://makersbd.com/product/dc-4.5v-to-30v-digital-voltmeter-panel-meter-red-led-123',
        'https://makersbd.com/product/usb-volt-current-tester-meter-for-charger-power-bank-any-usb-122',
        'https://makersbd.com/product/easy-12v-battery-level-indicator-module-4-paragraph-4-indicator-led-lights-xd-82b-113',
        'https://makersbd.com/product/digital-display-mini-usb-power-current-voltage-meter-tester-portable-mini-current-and-voltage-detector-charger-doctor-92',
        'https://makersbd.com/product/0.28-inch-dc3.7v-100v-mini-digital-voltmeter-voltage-tester-meter-red-led-screen-electronic-parts-accessories-68',
        'https://makersbd.com/product/PD22.5W-Transparent-Power-Bank-Shell',
        'https://makersbd.com/product/3-cell-18650-power-bank-case-fast-charge-double-usb-type-c',
        'https://makersbd.com/product/8-cell-power-bank-case-abs-2a',
        'https://makersbd.com/product/2a-boost-charge-module',
        'https://makersbd.com/product/cob-led-filament-edison-bulb-lamp-parts-3v',
        'https://makersbd.com/product/cob-led-filament-edison-bulb-lamp-parts',
        'https://makersbd.com/product/5v-usb-small-fan-speed-controller-regulator-with-switch-5w-load-176',
        'https://makersbd.com/product/lm2596-constant-current-voltage-led-driven-battery-charging-power-supply-buck-module-high-efficiency-170',
        'https://makersbd.com/product/lm2596-with-display-adjustable-step-down-buck-converter-4~40v-module-167',
        'https://makersbd.com/product/w3230-high-precision-temperature-control-switch-ac-220v-version-161',
        'https://makersbd.com/product/w3230-high-precision-temperature-control-switch-dc-12v-version-160',
        'https://makersbd.com/product/5a-90w-pwm-dc-motor-speed-controller-module-6v-12v-24v-stepless-speed-4.5v-35v-adjustable-156',
        'https://makersbd.com/product/hw-433-5w+5w-dual-channel-bluetooth-audio-stereo-amplifier-18650-battery-holder-dc-5v-164',
        'https://makersbd.com/product/ca-6928-bluetooth-audio-module-3.3v-5v-dual-audio-board-128',
        'https://makersbd.com/product/mini-xh-m125-xpt8871-mono-amplifier-board-5w-3v-5v-112',
        'https://makersbd.com/product/pam8403-mini-power-amplifier-board-2x3w-2-channels-stereo-digital-audio-amplifier-module-104',
        'https://makersbd.com/product/passive-tone-board-xh-m802-amplifier-preamp-power-module-low-high-sound-adjustment-board-74',
        'https://makersbd.com/product/zk-502l-50wx2-digital-bluetooth-audio-amplifier-mini-bluetooth-5.0-wireless-audio-digital-power-amplifier-stereo-board-73',
        'https://makersbd.com/product/zk-mt21-2x50w+100w-2.1-channel-subwoofer-digital-power-amplifier-board-aux-12v-24v-71',
        'https://makersbd.com/product/xh-m139-digital-2x50w-100w-sub-2.1-channel-original-tpa3116d2x2-digital-amplifier-3-channels-pure-hifi-music-70',
        'https://makersbd.com/product/xh-m543-dual-channel-d-class-digital-power-amplifier-board-tpa3116d2-audio-amplifier-module-high-power-2*120w-dc-12v-24v-64',
        'https://makersbd.com/product/wuzhi-zk-502mt-with-app-bluetooth-5.0-50w+50w-class-d-amplifier-2.0-channel-with-app-support-58',
        'https://makersbd.com/product/xh-m544-digital-amplifier-board-original-tpa3116da-150w-d2-mono-channel-amplifier-dc-12v-24v-51',
        'https://makersbd.com/product/xh-a901-digital-matching-tone-board-treble-and-bass-adjustment-preamp-50',
        'https://makersbd.com/product/portable-battery-spot-welder-machine-power-bank',
        'https://makersbd.com/product/nickel-strip-for-18650-21700-battery-spot-welding-131',
        'https://makersbd.com/product/18650-2-tank-8.4v-rechargeable-battery-holder-case-108',
        'https://makersbd.com/product/18650-3-tank-12.6v-rechargeable-battery-holder-case-107',
        'https://makersbd.com/product/18650-lithium-battery-wrap-pvc-heat-shrink-tube-29.5mm-x-72mm-insulated-film-protect-case-pack-sleeving-1-pc-106',
        'https://makersbd.com/product/18650-lithium-battery-cap-battery-pack-spacer-high-quality-strong-plastic-holder-bracket-1-pc-105',
        'https://makersbd.com/product/diy-12v-spot-welding-kit-control-board-%E2%80%8Bdiy-nickel-plated-lithium-battery-pack-18650-spot-welder-35',
        'https://makersbd.com/product/nano-v3.0-expansion-board-terminal-adapter-nano-io-shield-extension-for-arduino-avr-atmega328p-147',
        'https://makersbd.com/product/l293d-motor-drive-shield-dual-for-arduino-expansion-board-motor-control-shield-143',
        'https://makersbd.com/product/non-smd-uno-r3-development-board-official-version-arduino-uno-r3-mega328p-with-usb-cable-136',
        'https://makersbd.com/product/12v-4-channel-relay-module-optocoupler-for-arduino-arm-avr-dsp-pic-msp-low-level-signal-mcu-plc-control-116',
        'https://makersbd.com/product/5v-low-level-trigger-1-channel-relay-module-for-pic-avr-dsp-arm-mcu-arduino-115',
        'https://makersbd.com/product/raspberry-pi-pico-board-rp2040-dual-core-264kb-arm-low-power-microcomputer-high-performance-84',
        'https://makersbd.com/product/raspberry-pi-4-case-official-abs-enclosure-raspberry-pi-4b-1gb-2gb-4gb-box-shell-from-the-raspberry-pi-foundation-81',
        'https://makersbd.com/product/arduino-nano-v3.0-development-board-atmega328p-5v-16mhz-ch340-driver-with-cable-57',
        'https://makersbd.com/product/esp8266-wifi-module-nodemcu-lua-v3-iot-development-board-type-c-interface-ch340-56',
        'https://makersbd.com/product/arduino-uno-r3-%28ch340g%29-new-type-c-interface-improved-version-53',
        'https://makersbd.com/product/mini-usb-led-light-lamp',
        'https://makersbd.com/product/gaming-pendrive-game-controller-flashdrive',
        'https://makersbd.com/product/2-in-1-wireless-car-vacuum-cleaner-6000pa-120w-cordless-handheld-portabale-vacuum-cleaner-with-air-blower-feature-165',
        'https://makersbd.com/product/ske-sk616-mini-dc-ups-for-wifi-router-+onu-+-ip-camera-cc-camera-%285-output%29-103',
        'https://makersbd.com/product/wgp-mini-ups-10400-mah-battery-5v,-12v,-12v-new-model-with-3a-charger-102',
        'https://makersbd.com/product/wgp-mini-ups-10400-mah-battery-5v,-9v,-12v-new-model-101',
        'https://makersbd.com/product/digital-indoor-thermometer-hygrometer-htc-1-aaa-battery-operated-temperature-humidity-meter-clock-98',
        'https://makersbd.com/product/jbl-go-3-portable-wireless-hifi-waterproof-bluetooth-speaker-premium-best-price-77',
        'https://makersbd.com/product/ske-poe-432p-mini-dc-ups-25watt-5v-9v-12v-&-poe-support-15-24v-76',
        'https://makersbd.com/product/775-motor-dc12v-21000rpm-double-bearing',
        'https://makersbd.com/product/220v-60w-soldring%20iron-budget-sodering',
        'https://makersbd.com/product/65g-solder-lead-1pc',
        'https://makersbd.com/product/Auto-Cooling-Fan-Diy-Project-Pack',
        'https://makersbd.com/product/3mm-mixed-led-pack-2.1v-20ma-red-green-yellow-105pcs-35pcs-each-181',
        'https://makersbd.com/product/green-led-3mm-2.1v-20ma-50pcs-180',
        'https://makersbd.com/product/green-led-3mm-2.1v-20ma-50pcs-179',
        'https://makersbd.com/product/red-led-3mm-2.1v-20ma-50pcs-178',
        'https://makersbd.com/product/30pcs-lot-104-polyester-film-capacitor-0.1uf-250v-film-capacitor-0.1j-250v-175',
        'https://makersbd.com/product/55v-49a-irfz44n-power-transistor-mosfet-n-channel-for-eletronic-project-174',
        'https://makersbd.com/product/10k-50pcs+-33k-50-pcs-carbon-film-resistor-100pcs-173',
        'https://makersbd.com/product/33k-ohm-carbon-film-resistor-100-pcs-172',
        'https://makersbd.com/product/10k-ohm-carbon-film-resistor-100-pcs-171',
        'https://makersbd.com/product/glass-fuse-with-10a-current-and-250v-ac-rated-voltage,-fast-acting-5-x-20mm--5pcs-169',
        'https://makersbd.com/product/anti-slip-safety-gloves-wear-resistant-nylon-full-finger-touch-supperted-rubber-gripped-anti-uv-166',
        'https://makersbd.com/product/10pcs-female-to-female-jumper-wire-cable-set-20cm-long-159',
        'https://makersbd.com/product/10pcs-male-to-female-jumper-wire-cable-set-20cm-long-158',
        'https://makersbd.com/product/10pcs-male-to-male-jumper-wire-cable-set-20cm-long-157',
        'https://makersbd.com/product/high-load-led-dimmer-pwm-brightness-regulator-motor-speed-controller-12v-24v30a-155',
        'https://makersbd.com/product/3a-high-current-lithium-battery-fast-charging-board-ip2312-cc-cv-mode-5v-to-4.2v-18650-battery-type-c-154',
        'https://makersbd.com/product/ultra-small-type-c-lithium-battery-charging-module-1a-3.7v4.2v-protection-board-tp4056-153',
        'https://makersbd.com/product/time-delay-relay-module-trigger-off-on-switch-timing-cycle-999-minutes-for-arduino-5v-152',
        'https://makersbd.com/product/pwm-motor-speed-controller-dc-fan-regulator-adjustable-motor-speed-6v-12v-24v-28v-3a-80w-1203bk-pwm-150',
        'https://makersbd.com/product/drv8825-stepper-motor-driver-with-heat-sink-3d-printer-cnc-parts-ramps-1.4-149',
        'https://makersbd.com/product/arduino-cnc-shield-v3-3d-print-laser-engraving-cnc-extension-diy-148',
        'https://makersbd.com/product/ultrasonic-distance-measurement-sensor-module-hc-sr04+-146',
        'https://makersbd.com/product/12v-lithium-lead-acid-li-po-battery-capacity-indicator-with-under-voltage-prompt-and-single-button-60',
        'https://makersbd.com/product/10-in-1-usb-tester-current-4-30v-voltage-ampere-meter-timing-ammeter-lcd-colour-monitor-cut-off-power-indicator-power-monitor-55',
        'https://makersbd.com/product/dc-0-100v-digital-voltmeter-ammeter-10a-voltage-current-meter-dual-led-display-47',
        'https://makersbd.com/product/digital-voltmeter-ac-plug-voltage-tester-lcd-display-with-led-backlit-ac-110v-220v-%2880v-300v%29-41',
        'https://makersbd.com/product/usb-boost-cable-5v-to-12v-boost-converter-adapters-usb-to-dc-jack-for-wifi-router-mini-fan-speaker-145',
        'https://makersbd.com/product/usb-fan-speed-controller-auxiliary-tool-dc-4v-12v-5w-xy-fs-usb-fan-stepless-regulator-142',
        'https://makersbd.com/product/adjustable-0.2--9a-300w-step-down-buck-converter-5-40v-to-1.2-35v-xl4016-141',
        'https://makersbd.com/product/2s-8a-li-ion-8.4v-18650-bms-battery-protection-board-battery-cell-pack-140',
        'https://makersbd.com/product/full-protocol-qc4.0-qc3.0-fast-charge-module-6--35v-scp-fcp-apple-pd-qualcomm-usb-&-type-c-support-135',
        'https://makersbd.com/product/xl6009-auto-boost-buck-adjustable-step-up-&-step-down-converter-1.25-36v-adjustable-127',
        'https://makersbd.com/product/lm2596-dc-to-dc-buck-converter-step-down-power-supply-module-adjustable-126',
        'https://makersbd.com/product/5v-2.4a-type-c-usb-lithium-battery-charging-with-protection-power-bank-circuit-board',
        'https://makersbd.com/product/2-channel-qc3.0-qc2.0-usb-dc-dc-charging-step-down-module-6-32v-9v-12v-24v-to-fast-quick-charger-3v-5v-12v-circuit-board-power-bank-circuit',
        'https://makersbd.com/product/qc-3.0-2.0-usb-fast-quick-charging-module-diy-charge-board-phone-charger',
        'https://makersbd.com/product/22.5w-fast-charging-power-bank-circuit-5-ports-bi-directional-qc4-pd3.0-sw6206-3.7v-input-54',
        'https://makersbd.com/product/dual-usb-5v-2.4a-power-bank-circuit-total-5-ports-37',
        'https://makersbd.com/product/ultra-bright-white-cob-led-light-round-shape-ring-light-dc-4v-5w-smd-124',
        'https://makersbd.com/product/hand-sweep-switch-3a-12v-24v-72w-hand-wave-scan-sensor-switch-on-off-diy-111',
        'https://makersbd.com/product/5mw-red-cross-laser-diode-module-focusable-industrial-class-650nm-110',
        'https://makersbd.com/product/power-failure-auto-switching-standby-battery-module-5v-48v-universal-emergency-converter-yx850-97',
        'https://makersbd.com/product/mini-zvs-induction-heating-module-dc-5-12.0v-input-voltage-high-frequency-120w-94',
        'https://makersbd.com/product/mini-slim-mobile-usb-night-light-3led-lamp-5v-usb-camping-light-baby-night-light-91',
        'https://makersbd.com/product/xh-m229-desktop-pc-atx-power-supply-adapter-board-24pin-output-terminal-benchtop-power-board-69',
        'https://makersbd.com/product/hw-586-zb2l3-1.2v-12v-18650-li-ion-lithium-battery-capacity-tester-resistance-lead-acid-battery-capacity-meter-discharge-tester-59',
        'https://makersbd.com/product/dc-3v-6v-bis-400kv-400000v-boost-step-up-power-module-high-voltage-generator-40',
        'https://makersbd.com/product/4a-7.4v-2s-bms-18650-lithium-battery-protection-board-8.4v-overcurrent-and-over-voltage-99',
        'https://makersbd.com/product/3s-8a-12.6v-18650-lithium-battery-protection-board-11.1v-12.6v-overcharge-over-discharge-protect-8a-3-cell-pack-li-ion-bms-90',
        'https://makersbd.com/product/3s-20a-lithium-battery-protection-board-bms%29_-18650-charger-pcb-bms-protection-board-12.6v-cell-48',
        'https://makersbd.com/product/3s-12.6v-18650-lithium-battery-protection-board-%28bms%29-balanced-version-40a-current-44',
        'https://makersbd.com/product/tp5100-single-or-2-cells-lithium-ion-battery-charger-module-2a-4.2v-&-8.4v-39',
        'https://makersbd.com/product/tp4056-lithium-battery-charger-module-type-c-with-dual-protection-4.2v-1a-38',
        'https://makersbd.com/product/xl6009-step-up-dc-voltage-booster-module-adjustable-125',
        'https://makersbd.com/product/mini-dc-dc-boost-step-up-3.7v-to-12v-module-can-set-5v-8v-9v--compact-dc-dc-converter-43',
        'https://makersbd.com/product/mt3608-dc-dc-step-up-converter-booster-module-max-output-28v-2a-36',
        'https://makersbd.com/product/stereo-bluetooth-hifi-audio-amplifier-board-20w*2-high-power-12v-24v-usb-aux-with-app-support-xy-ap15h-49',
        'https://makersbd.com/product/zk-tb21-digital-power-amplifier-2.1-channel-bt5.0-board-high-fidelity-surround-sound-42',
        'https://makersbd.com/product/digital-volt-ampere-meter-diy-project-pack-138',
        'https://makersbd.com/product/isd1820-voice-recording-recorder-module-with-mic-sound-audio-loudspeaker-129',
        'https://makersbd.com/product/cd4017-colorful-voice-control-rotating-led-light-diy-kit-pcb-parts-solder-practice-100',
        'https://makersbd.com/product/metal-detector-kit-diy-dc-3v-5v-non-contact-sensing-solder-practice-pcb-&-parts-95',
        'https://makersbd.com/product/max7219-dot-matrix-module-for-arduino-microcontroller-4-in-1-display-with-5p-line-red-52',
        'https://makersbd.com/product/0.91-inch-oled-display-0.91%22-blue-128x32-oled-display-module-0.91%22-iic-communicate-46',
        'https://makersbd.com/product/0.96-oled-display-blue-i2c-iic-serial-128x64-oled-ssd1309-display-module-for-arduino-and-raspberry-pi-45',
        'https://makersbd.com/product/arduino-voice-sound-detection-sensor-intelligent-module-for-smart-arduino-projects-144',
        'https://makersbd.com/product/rubber-tire-wheel-for-arduino-motor-smart-robot-car-1pc-137',
        'https://makersbd.com/product/color-recognition-sensor-tcs3200d-module-tcs230-upgraded-version-134',
        'https://makersbd.com/product/mg90s-metal-gear-micro-servo-motor-180%C2%B0-degree-tower-pro-133',
        'https://makersbd.com/product/electronic-building-block-ad-keyboard-simulation-keyboard-module-gaming-buttons-diy-132',
        'https://makersbd.com/product/ir-infrared-obstacle-avoidance-sensor-module-for-arduino-diy-smart-car-robot-reflective-photoelectric-3pin-67',
        'https://makersbd.com/product/mfrc-522-rc-522-module-rc522-wireless-ic-rfid-fudan-mfrc522-spi-writer-reader-card-key-chain-sensor-kits-13.56mhz-for-arduno-66',
        'https://makersbd.com/product/l298n-motor-driver-board-l298-module-for-arduino-dual-h-bridge-dc-stepper-motor-smart-car-robotics-65',
        'https://makersbd.com/product/12v-mini-cooling-fan-40x40x20mm-small-exhaust-fan-130',
        'https://makersbd.com/product/5-pcs-tactile-push-switch-12*12*7.3mm-button-black-yellow-b3f-4055-120',
        'https://makersbd.com/product/5pcs-dc-005-power-jack-plug-3-pin-female-socket-5.5mmx2.5mm-119',
        'https://makersbd.com/product/high-load-kcd4-rocker-switch-16a-250v-4-pin-black-red-114',
        'https://makersbd.com/product/10pcs-double-head-alligator-clip-set-test-cable-for-repair-works-10-pieces-in-5-colors-93',
        'https://makersbd.com/product/nickel-strip-for-18650-21700-battery-spot-welding-soldering-139',
        'https://makersbd.com/product/SWY-18650-lithium-ion-battery-2600mah',
        'https://makersbd.com/product/LifePO4-Phosphate-Power-Bank-Circuit-22.5W',
        'https://makersbd.com/product/21700-Mini-Power-Bank-Case-PD-20W',
        'https://makersbd.com/product/Multifunction-Motion-Sensor-Alarm',
        'https://makersbd.com/product/Electronic-Hand-Warmer',
        'https://makersbd.com/product/LED-Matrix-Flexible-Display-RGB-Full-Colour-20x64-Pixels',
    ];

    public function handle(): int
    {
        if ($this->option('clear')) {
            if (! $this->confirm('This will delete ALL existing products, brands, and categories. Are you sure?')) {
                $this->info('Aborted.');

                return self::SUCCESS;
            }

            $this->clearExistingData();
        }

        $total = count($this->productUrls);
        $imported = 0;
        $failed = 0;

        $this->info("Starting import of {$total} products from makersbd.com...");
        $this->newLine();

        foreach ($this->productUrls as $index => $url) {
            $num = $index + 1;
            $this->output->write("[{$num}/{$total}] Fetching ... ");

            try {
                $html = $this->fetchPage($url);

                if ($html === null) {
                    $this->line('<fg=red>SKIP (HTTP error)</>');
                    $failed++;

                    continue;
                }

                $data = $this->parseProduct($html);

                if ($data === null || empty($data['name']) || empty($data['price'])) {
                    $this->line('<fg=yellow>SKIP (no data)</>');
                    $failed++;

                    continue;
                }

                $this->saveProduct($data);

                $this->line('<fg=green>OK — ' . $data['name'] . '</>');
                $imported++;
            } catch (\Throwable $e) {
                $this->line('<fg=red>ERROR: ' . $e->getMessage() . '</>');
                $failed++;
            }

            usleep(300_000); // 300ms delay between requests
        }

        $this->newLine();
        $this->info("Import complete. Imported: {$imported}, Failed/Skipped: {$failed}");

        return self::SUCCESS;
    }

    private function clearExistingData(): void
    {
        $this->warn('Deleting all existing products, brands, and categories...');

        Product::query()->forceDelete();
        Brand::query()->delete();
        Category::query()->delete();

        $this->info('Cleared.');
    }

    private function fetchPage(string $url): ?string
    {
        $response = Http::timeout(30)
            ->withHeaders(['User-Agent' => 'Mozilla/5.0 (compatible; CartAndBuy-Importer/1.0)'])
            ->get($url);

        if (! $response->successful()) {
            return null;
        }

        return $response->body();
    }

    /** @return array<string, mixed>|null */
    private function parseProduct(string $html): ?array
    {
        // Name from og:title
        $name = '';
        if (preg_match('/<meta property="og:title" content="([^"]+)"/', $html, $m)) {
            $name = html_entity_decode($m[1], ENT_QUOTES | ENT_HTML5, 'UTF-8');
        }

        if (empty($name)) {
            return null;
        }

        // Price parsing: old_price = regular, new_price = sale
        $regularPrice = null;
        $salePrice = null;

        if (preg_match('/class="old_price"[^>]*>([\d,]+)/', $html, $m)) {
            $regularPrice = (float) str_replace(',', '', $m[1]);
        }

        if (preg_match('/class="new_price"[^>]*>([\d,]+)/', $html, $m)) {
            $salePrice = (float) str_replace(',', '', $m[1]);
        }

        // No sale structure: use JSON-LD price as regular price
        if ($regularPrice === null) {
            if (preg_match('/"price"\s*:\s*"([\d.]+)"/', $html, $m)) {
                $regularPrice = (float) $m[1];
            }
        }

        // If only new_price found (no old_price), treat as regular
        if ($regularPrice === null && $salePrice !== null) {
            $regularPrice = $salePrice;
            $salePrice = null;
        }

        if ($regularPrice === null || $regularPrice <= 0) {
            return null;
        }

        // SKU
        $sku = null;
        if (preg_match('/SKU\s*:\s*<\/span>\s*([A-Z0-9\-]+)/', $html, $m)) {
            $sku = trim($m[1]);
        }

        // Description from tab content
        $description = '';
        if (preg_match('/Description<\/h\d>(.*?)<\/div>/s', $html, $m)) {
            $description = trim(strip_tags($m[1]));
        }

        if (empty($description)) {
            $description = $name;
        }

        // Product images (class="block__pic")
        $images = [];
        preg_match_all('/src="(https:\/\/makersbd\.com\/public\/uploads\/product\/[^"]+)"\s+class="block__pic"/', $html, $matches);
        foreach ($matches[1] as $img) {
            if (! in_array($img, $images)) {
                $images[] = $img;
            }
        }

        // Fallback to og:image
        if (empty($images)) {
            if (preg_match('/<meta property="og:image" content="([^"]+)"/', $html, $m)) {
                $images[] = $m[1];
            }
        }

        // Category from breadcrumb section only
        $parentCategoryName = null;
        $categoryName = null;
        $bcIdx = strpos($html, 'breadcrumb">');

        if ($bcIdx !== false) {
            $bcSection = substr($html, $bcIdx, 800);
            preg_match_all('/href="https:\/\/makersbd\.com\/category\/[^"]+">([^<]+)<\/a>/', $bcSection, $bcCats);
            $bcCats = array_map(fn ($c) => html_entity_decode(trim($c), ENT_QUOTES | ENT_HTML5, 'UTF-8'), $bcCats[1]);

            if (count($bcCats) >= 2) {
                $parentCategoryName = $bcCats[0];
                $categoryName = $bcCats[1];
            } elseif (count($bcCats) === 1) {
                $categoryName = $bcCats[0];
            }
        }

        // Brand
        $brandName = null;
        if (preg_match('/[Bb]rand\s*:\s*<\/span>\s*([^<\n\r]+)/', $html, $m)) {
            $b = trim(strip_tags($m[1]));
            if (! empty($b) && strlen($b) < 60) {
                $brandName = $b;
            }
        }

        if ($brandName === null && str_contains(strtolower($name), 'wuzhi')) {
            $brandName = 'Wuzhi Audio';
        }

        // Tags derived from product name keywords
        $tags = $this->extractTags($name);

        return [
            'name' => $name,
            'price' => $regularPrice,
            'sale_price' => $salePrice,
            'sku' => $sku,
            'description' => $description,
            'images' => $images,
            'category_name' => $categoryName,
            'parent_category_name' => $parentCategoryName,
            'brand_name' => $brandName,
            'tags' => $tags,
        ];
    }

    /** @return array<string> */
    private function extractTags(string $name): array
    {
        $tags = [];
        $lower = strtolower($name);

        $keywords = [
            'arduino' => 'Arduino',
            'raspberry' => 'Raspberry Pi',
            'esp8266' => 'ESP8266',
            'esp32' => 'ESP32',
            'bluetooth' => 'Bluetooth',
            'amplifier' => 'Amplifier',
            'battery' => 'Battery',
            'charger' => 'Charger',
            'bms' => 'BMS',
            'voltmeter' => 'Voltmeter',
            'power bank' => 'Power Bank',
            'buck' => 'Buck Converter',
            'boost' => 'Boost Converter',
            'relay' => 'Relay',
            'sensor' => 'Sensor',
            'motor' => 'Motor',
            'oled' => 'OLED Display',
            'led' => 'LED',
            'lithium' => 'Lithium',
            '18650' => '18650',
            'soldering' => 'Soldering',
            'usb' => 'USB',
            'fan' => 'Fan',
            'module' => 'Module',
            'diy' => 'DIY',
        ];

        foreach ($keywords as $keyword => $tag) {
            if (str_contains($lower, $keyword)) {
                $tags[] = $tag;
            }
        }

        return array_values(array_unique($tags));
    }

    /** @param array<string, mixed> $data */
    private function saveProduct(array $data): void
    {
        $parentCategory = null;
        if (! empty($data['parent_category_name'])) {
            $parentSlug = Str::slug($data['parent_category_name']);
            $parentCategory = Category::firstOrCreate(
                ['slug' => $parentSlug],
                ['name' => $data['parent_category_name'], 'slug' => $parentSlug]
            );
        }

        $category = null;
        if (! empty($data['category_name'])) {
            $catSlug = Str::slug($data['category_name']);
            $category = Category::firstOrCreate(
                ['slug' => $catSlug],
                [
                    'name' => $data['category_name'],
                    'slug' => $catSlug,
                    'parent_id' => $parentCategory?->id,
                ]
            );
        }

        $brand = null;
        if (! empty($data['brand_name'])) {
            $brandSlug = Str::slug($data['brand_name']);
            $brand = Brand::firstOrCreate(
                ['slug' => $brandSlug],
                ['name' => $data['brand_name'], 'slug' => $brandSlug]
            );
        }

        $baseSlug = Str::slug($data['name']);
        $slug = $baseSlug;
        $counter = 1;
        while (Product::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $counter++;
        }

        Product::create([
            'name' => $data['name'],
            'slug' => $slug,
            'sku' => $data['sku'],
            'description' => $data['description'],
            'price' => $data['price'],
            'sale_price' => $data['sale_price'] ?? null,
            'cost_price' => null,
            'stock_qty' => 10,
            'low_stock_threshold' => 5,
            'category_id' => $category?->id,
            'brand_id' => $brand?->id,
            'images' => $data['images'],
            'tags' => $data['tags'] ?? [],
            'is_active' => true,
            'is_featured' => false,
            'status' => 'published',
        ]);
    }
}
