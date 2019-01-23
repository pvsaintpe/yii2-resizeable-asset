<?php
/**
 * Created by PhpStorm.
 * User: novozhilova.en
 * Date: 23.01.2019
 * Time: 11:34
 */

namespace pvsaintpe\resizeable;
use kartik\base\AssetBundle;

/**
 * Class ResizeableAsset
 * @package pvsaintpe\resizeable
 */
class ResizeableAsset extends AssetBundle
{
    public function init()
    {
        $this->setSourcePath(__DIR__ . '/assets');
        $this->setupAssets('css', ['resizeable']);
        $this->setupAssets('js', ['resizeable']);
        parent::init();
    }
}

