module ExtensibleRecord exposing (..)

type alias R a b =
    { a
        | f1 : String
        , f2 : b
    }

fnSignature : b -> { a | f3 : b } -> b
fnSignature b _ =
    b
