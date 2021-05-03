module PatternMatch exposing (..)


fnSignature { f1, f2 } =
    ( f1, f2 )


fnSignature record =
    let
        { f3 } =
            record
    in
    f3
