import  Pack  from '../Models/Pack';
import MediaItemSource from "../Models/MediaItemSource";
import MediaItemType from "../Models/MediaItemType";

var pacman = Pack.fromType(MediaItemSource.Often, MediaItemType.pack, '321');
var pacman = Pack.fromType(MediaItemSource.Genius, MediaItemType.artist, '321');
var pacman = Pack.fromType(MediaItemSource.Genius, MediaItemType.track, '321');
var pacman = Pack.fromType(MediaItemSource.Genius, MediaItemType.lyric, '321');
